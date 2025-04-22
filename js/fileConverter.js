let pdfjsLib, mammoth;

const loadPdfJs = async () => {
  if (!pdfjsLib) {
    await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  return pdfjsLib;
};

const loadMammoth = async () => {
  if (!mammoth) {
    await import("https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js");
    mammoth = window.mammoth;
  }
  return mammoth;
};

const convertPdfToText = async (file) => {
  const pdf = await (await loadPdfJs()).getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then((page) => page.getTextContent()))
  );
  return pages.flatMap((content) => content.items.map((item) => item.str)).join(" ");
};

export const convertFileToText = async (file) => {
  try {
    if (file.type === "application/pdf") return await convertPdfToText(file);
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      return (await (await loadMammoth()).extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    if (file.type === "text/plain") return await file.text();
    throw new Error("Unsupported file type");
  } catch (error) {
    throw new Error(`Error processing ${file.name}: ${error.message}`);
  }
};
