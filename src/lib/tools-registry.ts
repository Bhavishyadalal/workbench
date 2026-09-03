export type ToolCategory =
  | "image"
  | "pdf"
  | "convert"
  | "text"
  | "extras";

export interface ToolDef {
  slug: string;
  name: string;
  short: string;
  category: ToolCategory;
}

export const categoryMeta: Record<
  ToolCategory,
  { label: string; blurb: string; accent: string }
> = {
  image: {
    label: "Image",
    blurb: "Compress, resize, crop, and convert — all in your browser.",
    accent: "#5FC7B0",
  },
  pdf: {
    label: "PDF",
    blurb: "Merge, split, compress, and rework PDFs without uploading them anywhere.",
    accent: "#6C9CF0",
  },
  convert: {
    label: "Convert",
    blurb: "Units, currency, timezones, and number bases.",
    accent: "#EFB347",
  },
  text: {
    label: "Text & Dev",
    blurb: "Formatters, encoders, counters, and testers for text and code.",
    accent: "#C994E8",
  },
  extras: {
    label: "Extras",
    blurb: "The small daily-use tools that don't fit anywhere else.",
    accent: "#E8703D",
  },
};

export const tools: ToolDef[] = [
  // Image
  { slug: "image-compress", name: "Compress Image", short: "Shrink file size, keep quality", category: "image" },
  { slug: "image-resize", name: "Resize Image", short: "Change width & height", category: "image" },
  { slug: "image-convert", name: "Convert Format", short: "PNG, JPG, WebP", category: "image" },
  { slug: "image-crop", name: "Crop Image", short: "Cut to the part you need", category: "image" },
  { slug: "image-rotate", name: "Rotate / Flip", short: "Fix orientation", category: "image" },
  { slug: "image-watermark", name: "Add Watermark", short: "Stamp text over an image", category: "image" },
  { slug: "image-base64", name: "Image to Base64", short: "Encode for embedding", category: "image" },
  // PDF
  { slug: "pdf-compress", name: "Compress PDF", short: "Reduce PDF file size", category: "pdf" },
  { slug: "pdf-merge", name: "Merge PDFs", short: "Combine multiple files into one", category: "pdf" },
  { slug: "pdf-split", name: "Split PDF", short: "Pull out the pages you need", category: "pdf" },
  { slug: "pdf-to-images", name: "PDF to Images", short: "Export pages as PNGs", category: "pdf" },
  { slug: "images-to-pdf", name: "Images to PDF", short: "Build a PDF from photos", category: "pdf" },
  { slug: "pdf-rotate", name: "Rotate PDF Pages", short: "Fix sideways pages", category: "pdf" },
  { slug: "pdf-protect", name: "Password Protect PDF", short: "Lock a PDF with a password", category: "pdf" },
  // Convert
  { slug: "unit-converter", name: "Unit Converter", short: "Length, weight, temp, volume, speed", category: "convert" },
  { slug: "currency-converter", name: "Currency Converter", short: "Live exchange rates", category: "convert" },
  { slug: "timezone-converter", name: "Timezone Converter", short: "Compare times across cities", category: "convert" },
  { slug: "base-converter", name: "Number Base Converter", short: "Binary, hex, decimal, octal", category: "convert" },
  // Text
  { slug: "word-counter", name: "Word & Character Counter", short: "Count words, chars, sentences", category: "text" },
  { slug: "case-converter", name: "Case Converter", short: "UPPER, lower, Title Case", category: "text" },
  { slug: "json-formatter", name: "JSON Formatter", short: "Validate & pretty-print JSON", category: "text" },
  { slug: "base64", name: "Base64 Encode / Decode", short: "Text to Base64 and back", category: "text" },
  { slug: "url-encode", name: "URL Encode / Decode", short: "Escape and unescape URLs", category: "text" },
  { slug: "qr-generator", name: "QR Code Generator", short: "Turn text or a link into a QR code", category: "text" },
  { slug: "markdown-preview", name: "Markdown Previewer", short: "Live-render Markdown", category: "text" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", short: "Placeholder text, any length", category: "text" },
  { slug: "regex-tester", name: "Regex Tester", short: "Test patterns against sample text", category: "text" },
  { slug: "diff-checker", name: "Diff Checker", short: "Compare two blocks of text", category: "text" },
  // Extras
  { slug: "password-generator", name: "Password Generator", short: "Strong, random passwords", category: "extras" },
  { slug: "color-picker", name: "Color Picker", short: "Pick a color, get every format", category: "extras" },
  { slug: "age-calculator", name: "Age / Date Calculator", short: "Days between two dates", category: "extras" },
  { slug: "timer", name: "Countdown / Stopwatch", short: "Time anything", category: "extras" },
  { slug: "random-picker", name: "Random Picker", short: "Numbers, names, or a spinning wheel", category: "extras" },
  { slug: "file-hash", name: "File Hash Generator", short: "MD5, SHA-1, SHA-256", category: "extras" },
];

export const toolsByCategory = (cat: ToolCategory) =>
  tools.filter((t) => t.category === cat);

export const findTool = (slug: string) => tools.find((t) => t.slug === slug);
