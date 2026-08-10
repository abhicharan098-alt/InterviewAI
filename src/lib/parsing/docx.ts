import mammoth from "mammoth";

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX Parsing Error:", error);
    throw new Error("Failed to extract text from DOCX file. It might be corrupted.");
  }
}
