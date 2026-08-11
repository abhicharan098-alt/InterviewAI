/**
 * Central validation for uploaded resume files (PDF / DOCX).
 * Kept outside the route handler so it can be unit-tested.
 */
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const PDF_MIME = "application/pdf";
export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const DOC_MIME = "application/msword"; // legacy .doc

export const ALLOWED_MIME_TYPES = [PDF_MIME, DOCX_MIME];
export const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
export const LEGACY_DOC_EXTENSION = ".doc";

// Magic bytes
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK\x03\x04 (docx)
const EMPTY_ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x05, 0x06]); // PK\x05\x06
const OLE2_MAGIC = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]); // legacy .doc compound file

export type ResumeFileValidationResult =
  | { ok: true; safeFileName: string; contentType: string }
  | { ok: false; status: number; message: string };

function startsWith(head: Buffer, magic: Buffer): boolean {
  return head.length >= magic.length && head.subarray(0, magic.length).equals(magic);
}

/**
 * Takes only the basename of the original file name and strips every
 * character that could be used for path traversal or shell injection.
 * Rejects names that contain path separators or ".." outright.
 */
export function sanitizeFileName(original: string): string {
  const basename = original.split(/[\\/]/).pop() ?? "";
  // eslint-disable-next-line no-control-regex
  const cleaned = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "")
    .trim();
  return cleaned;
}

/**
 * Validates a resume file's declared type/size/name AND its actual binary
 * content (magic bytes) so renamed or malformed files are rejected before
 * anything is written to storage or the database.
 */
export function validateResumeFile(
  file: { name: string; type: string; size: number },
  buffer: Buffer
): ResumeFileValidationResult {
  const rawName = file.name ?? "";

  // Empty / missing file names
  if (!rawName || !rawName.trim()) {
    return { ok: false, status: 400, message: "No file name provided." };
  }

  // Path traversal: reject separators and parent-directory references.
  if (
    rawName.includes("\\") ||
    rawName.includes("/") ||
    rawName.includes("..") ||
    rawName.startsWith(".")
  ) {
    return {
      ok: false,
      status: 400,
      message: "Invalid file name.",
    };
  }

  // Empty files
  if (file.size === 0 || buffer.length === 0) {
    return { ok: false, status: 400, message: "The uploaded file is empty." };
  }

  // Size limit
  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      ok: false,
      status: 400,
      message: "File size exceeds the 5MB limit.",
    };
  }

  const safeFileName = sanitizeFileName(rawName);
  const lowerName = safeFileName.toLowerCase();
  const hasNoExtension = lowerName === "" || lowerName.startsWith(".");
  // Extension helper (mimics path.extname, kept dependency-free)
  const dotIndex = lowerName.lastIndexOf(".");
  const ext = hasNoExtension ? "" : dotIndex > 0 ? lowerName.slice(dotIndex) : "";

  // Legacy .doc (not parseable by the current PDF/DOCX parsers)
  if (
    ext === LEGACY_DOC_EXTENSION ||
    (file.type && file.type.toLowerCase() === DOC_MIME)
  ) {
    return {
      ok: false,
      status: 400,
      message:
        "Legacy .doc files are not supported. Please convert your resume to PDF or DOCX and try again.",
    };
  }

  // Extension must be one of our supported types.
  if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
    return {
      ok: false,
      status: 400,
      message: "Unsupported file type. Only PDF and DOCX are allowed.",
    };
  }

  // Declared MIME type must match (when the browser provides one).
  const declaredType = (file.type || "").toLowerCase();
  if (declaredType && !ALLOWED_MIME_TYPES.includes(declaredType)) {
    return {
      ok: false,
      status: 400,
      message: "Unsupported file type. Only PDF and DOCX are allowed.",
    };
  }

  const isPdf = ext === ".pdf" || declaredType === PDF_MIME;
  const isDocx = ext === ".docx" || declaredType === DOCX_MIME;
  const head = buffer.subarray(0, 1024);

  // Validate the actual binary content (magic bytes).
  if (isDocx && startsWith(head, OLE2_MAGIC)) {
    return {
      ok: false,
      status: 400,
      message:
        "That looks like a legacy .doc file. Please convert your resume to PDF or DOCX and try again.",
    };
  }
  if (isPdf && !startsWith(head, PDF_MAGIC)) {
    return {
      ok: false,
      status: 400,
      message: "The file is not a valid PDF. It may be corrupted or renamed.",
    };
  }
  if (isDocx && !(startsWith(head, ZIP_MAGIC) || startsWith(head, EMPTY_ZIP_MAGIC))) {
    return {
      ok: false,
      status: 400,
      message: "The file is not a valid DOCX document. It may be corrupted or renamed.",
    };
  }

  const contentType = isPdf ? PDF_MIME : DOCX_MIME;
  return { ok: true, safeFileName, contentType };
}