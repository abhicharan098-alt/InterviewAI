const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

async function main() {
  const resume = await prisma.resume.findFirst({ orderBy: { uploadedAt: 'desc' }});
  console.log("Resume ID:", resume.id);
  console.log("File Name:", resume.fileName);
  console.log("File Type:", resume.fileType);
  console.log("File Size DB:", resume.fileSize);
  console.log("File Path:", resume.fileUrl);
  
  try {
    const buffer = await fs.readFile(resume.fileUrl);
    console.log("Actual File Size (Buffer Length):", buffer.length);
    
    if (buffer.length === 0) {
      console.log("ERROR: Buffer is empty!");
      return;
    }
    
    console.log("Testing pdf-parse...");
    const data = await pdfParse(buffer);
    console.log("Extracted text length:", data.text.length);
    console.log("Preview:", data.text.substring(0, 100));
  } catch (error) {
    console.error("Extraction error:", error);
  }
}

main().finally(() => prisma.$disconnect());
