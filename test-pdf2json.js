const fs = require('fs/promises');
const fsSync = require('fs');
const PDFParser = require("pdf2json");

async function main() {
  const filePath = "C:/AI Interview Preparation Platform/storage/resumes/992cb4c6-32e3-47ac-8af2-7a15c532a099/891051179860255d324f02a3333a3dba.pdf";
  const buffer = await fs.readFile(filePath);
  
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

main().then(text => {
  console.log("Extracted length:", text.length);
  console.log("Preview:", text.substring(0, 100));
}).catch(console.error);
