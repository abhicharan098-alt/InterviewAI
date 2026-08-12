import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
// Importing the worker module registers `globalThis.pdfjsWorker` (a top-level
// side effect of pdf.worker.mjs). pdfjs then re-uses that in-process
// "main thread worker" and NEVER runs the dynamic `import("./pdf.worker.mjs")`
// that its fake-worker fallback uses. That dynamic import is annotated
// webpackIgnore/vite-ignore and therefore left verbatim by the bundler, so in
// a Next.js production build it resolves to a module that does not exist on
// disk and every extraction fails with:
//   Setting up fake worker failed: "Cannot find module '...pdf.worker.mjs'".
// Keeping the parser (pdfjs-dist) unchanged; this only fixes worker loading.
import "pdfjs-dist/legacy/build/pdf.worker.mjs";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf2json's bundled pdf.js fork cannot parse XRef-stream / ReportLab
  // resumes ("Invalid XRef stream header"), so we extract text with the
  // Node-compatible legacy build of pdf.js (pdfjs-dist) instead. The legacy
  // build includes the DOMMatrix/polyfill shims that are missing on the
  // serverless Node runtime and needs no separate worker file.
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  // verbosity: 0 (errors only) silences pdf.js warnings about standard fonts
  // (e.g. "Ensure that the standardFontDataUrl API parameter is provided"),
  // which are harmless for text extraction but would spam the server logs.
  const loadingTask = getDocument({ data, verbosity: 0 });

  try {
    const doc = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (typeof (item as { str?: unknown }).str === "string" ? (item as { str: string }).str : ""))
        .filter((str) => str.length > 0)
        .join(" ");
      text += pageText + "\n";
    }
    return text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF file. It might be corrupted or secured.");
  } finally {
    await loadingTask.destroy().catch(() => {});
  }
}
