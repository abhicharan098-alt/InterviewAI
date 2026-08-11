// Smoke test for the resume upload path: validation rules + storage layer.
// Compiled standalone and executed with Node (no DB, no network).
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");

const {
  validateResumeFile,
  sanitizeFileName,
  MAX_RESUME_FILE_SIZE,
  PDF_MIME,
  DOCX_MIME,
} = require("../.smoke-lib/validation/resumeFile.js");
const { LocalStorageProvider } = require("../.smoke-lib/storage/LocalProvider.js");
const { BlobStorageProvider } = require("../.smoke-lib/storage/BlobStorageProvider.js");

const PDF_BYTES = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n");
const DOCX_BYTES = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("word/document.xml raw bytes")]);
const DOC_OLE_BYTES = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
const GARBAGE = Buffer.from("this is definitely not a real resume file at all");

let passed = 0;
function check(label, fn) {
  try {
    Promise.resolve(fn()).then(() => {
      passed++;
      console.log(`  PASS  ${label}`);
    }).catch((e) => {
      console.error(`  FAIL  ${label}`);
      console.error(`        ${e.message}`);
      process.exitCode = 1;
    });
  } catch (e) {
    console.error(`  FAIL  ${label}`);
    console.error(`        ${e.message}`);
    process.exitCode = 1;
  }
}

console.log("=== validation ===");

check("valid PDF passes and is parsed as PDF", () => {
  const r = validateResumeFile({ name: "resume.pdf", type: PDF_MIME, size: PDF_BYTES.length }, PDF_BYTES);
  assert.equal(r.ok, true);
  assert.equal(r.contentType, PDF_MIME);
  assert.equal(r.safeFileName, "resume.pdf");
});

check("valid DOCX passes and is parsed as DOCX", () => {
  const r = validateResumeFile({ name: "My Resume.docx", type: DOCX_MIME, size: DOCX_BYTES.length }, DOCX_BYTES);
  assert.equal(r.ok, true);
  assert.equal(r.contentType, DOCX_MIME);
});

check("empty file rejected", () => {
  const r = validateResumeFile({ name: "empty.pdf", type: PDF_MIME, size: 0 }, Buffer.alloc(0));
  assert.equal(r.ok, false);
  assert.match(r.message, /empty/i);
});

check("oversized file rejected (5MB limit)", () => {
  const filler = Buffer.alloc(Math.max(0, MAX_RESUME_FILE_SIZE + 1 - PDF_BYTES.length), 0x20);
  const bigPdf = Buffer.concat([PDF_BYTES, filler]);
  const r = validateResumeFile({ name: "big.pdf", type: PDF_MIME, size: bigPdf.length }, bigPdf);
  assert.equal(r.ok, false);
  assert.match(r.message, /5MB/i);
});

check("legacy .doc rejected with helpful message", () => {
  const r = validateResumeFile({ name: "resume.doc", type: "application/msword", size: DOC_OLE_BYTES.length }, DOC_OLE_BYTES);
  assert.equal(r.ok, false);
  assert.match(r.message, /convert/i);
});

check("docx-named OLE file rejected as legacy .doc", () => {
  const r = validateResumeFile({ name: "resume.docx", type: DOCX_MIME, size: DOC_OLE_BYTES.length }, DOC_OLE_BYTES);
  assert.equal(r.ok, false);
  assert.match(r.message, /convert/i);
});

check("unsupported extension rejected", () => {
  const r = validateResumeFile({ name: "resume.txt", type: "text/plain", size: 5 }, Buffer.from("hello"));
  assert.equal(r.ok, false);
  assert.match(r.message, /Unsupported file type/i);
});

check("renamed garbage PDF rejected by magic bytes", () => {
  const r = validateResumeFile({ name: "resume.pdf", type: PDF_MIME, size: GARBAGE.length }, GARBAGE);
  assert.equal(r.ok, false);
  assert.match(r.message, /not a valid PDF/i);
});

check("renamed garbage DOCX rejected by magic bytes", () => {
  const r = validateResumeFile({ name: "resume.docx", type: DOCX_MIME, size: GARBAGE.length }, GARBAGE);
  assert.equal(r.ok, false);
  assert.match(r.message, /not a valid DOCX/i);
});

check("path traversal filename rejected", () => {
  const r = validateResumeFile({ name: "../../etc/passwd.pdf", type: PDF_MIME, size: PDF_BYTES.length }, PDF_BYTES);
  assert.equal(r.ok, false);
  assert.match(r.message, /Invalid file name/i);
  const r2 = validateResumeFile({ name: "..\\..\\evil.pdf", type: PDF_MIME, size: PDF_BYTES.length }, PDF_BYTES);
  assert.equal(r2.ok, false);
});

check("sanitizeFileName strips unsafe characters", () => {
  assert.equal(sanitizeFileName("My:Resume?*\u0000<>.pdf"), "MyResume.pdf");
  assert.equal(sanitizeFileName("C:\\Users\\x\\resume.pdf"), "resume.pdf");
  assert.equal(sanitizeFileName("resume.pdf"), "resume.pdf");
});

console.log("=== LocalStorageProvider round-trip ===");

check("upload -> readFile -> deleteFile on local disk", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "resume-smoke-"));
  const provider = new LocalStorageProvider(tmp);
  const up = await provider.uploadFile({ buffer: PDF_BYTES, fileName: "resume.pdf", mimeType: PDF_MIME }, "resumes/user-123");
  assert.ok(fs.existsSync(up.path), "uploaded file should exist on disk");
  const read = await provider.readFile(up.path);
  assert.deepEqual(read, PDF_BYTES);
  await provider.deleteFile(up.path);
  assert.equal(fs.existsSync(up.path), false, "file should be deleted");
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log("=== BlobStorageProvider (no network) ===");

check("isBlobRef identifies vercel blob URLs", () => {
  const p = new BlobStorageProvider();
  assert.equal(p.isBlobRef("https://xyzabc.public.blob.vercel-storage.com/r.pdf"), true);
  assert.equal(p.isBlobRef("https://xyzabc.blob.vercel-storage.com/r.pdf"), true);
  assert.equal(p.isBlobRef("C:\\storage\\resumes\\u\\x.pdf"), false);
  assert.equal(p.isBlobRef(""), false);
});

check("readFile on legacy local path throws clear message (no network)", () => {
  const p = new BlobStorageProvider();
  return assert.rejects(() => p.readFile("C:\\storage\\resumes\\u\\x.pdf"), /not available in cloud storage/);
});

check("deleteFile on legacy local path is a safe no-op (no network)", () => {
  const p = new BlobStorageProvider();
  return p.deleteFile("C:\\storage\\resumes\\u\\x.pdf").then(() => console.log("       (no-op ok)"));
});

setTimeout(() => {
  console.log(`\n${passed} checks passed`);
  if (process.exitCode) {
    console.error("SOME CHECKS FAILED");
  } else {
    console.log("ALL CHECKS PASSED");
  }
  process.exit(process.exitCode || 0);
}, 200);