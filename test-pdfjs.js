const fs = require('fs/promises');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js'); // Use legacy build for Node.js compatibility

async function main() {
  const filePath = "C:/AI Interview Preparation Platform/storage/resumes/992cb4c6-32e3-47ac-8af2-7a15c532a099/891051179860255d324f02a3333a3dba.pdf";
  const data = new Uint8Array(await fs.readFile(filePath));
  
  const loadingTask = pdfjsLib.getDocument({ data });
  
  try {
    const pdfDocument = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    console.log("Extracted text length:", fullText.length);
    console.log("Preview:", fullText.substring(0, 100));
  } catch (error) {
    console.error("PDF.js Error:", error);
  }
}

main();
