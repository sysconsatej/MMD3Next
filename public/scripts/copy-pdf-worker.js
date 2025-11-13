import { copyFile, mkdir } from "fs/promises";
import { resolve } from "path";

async function main() {
  const src = resolve("node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
  const outDir = resolve("public/pdfjs");
  const out = resolve(outDir, "pdf.worker.min.mjs");
  await mkdir(outDir, { recursive: true });
  await copyFile(src, out);
  console.log("Copied -> /public/pdfjs/pdf.worker.min.mjs");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
