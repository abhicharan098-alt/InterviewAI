export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Require inside the function to avoid any Next.js Edge runtime or Turbopack top-level issues
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parsing Error Details:", errData.parserError);
        reject(new Error("Failed to extract text from PDF file. It might be corrupted or secured."));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error("PDF Parsing Sync Error:", error);
      reject(new Error("Failed to extract text from PDF file. It might be corrupted or secured."));
    }
  });
}
