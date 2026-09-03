import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker/pdf.worker.min.mjs";

export default pdfjsLib;
