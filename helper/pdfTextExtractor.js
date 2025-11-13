// /helper/pdfTextExtractor.js
"use client";
/* eslint-disable */

// ---- CDN-only PDF.js loader (no bundler involvement, so no 'canvas') ----
let pdfjsLib = null;
let workerReady = false;

const CDN_BASE = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build";
const CDN_ESM = `${CDN_BASE}/pdf.mjs`;
const CDN_WORKER = `${CDN_BASE}/pdf.worker.min.mjs`;

async function ensurePdfjs() {
  if (typeof window === "undefined") throw new Error("Browser-only");

  if (!pdfjsLib) {
    // Import ESM from CDN; tell bundler to ignore this import
    pdfjsLib = await import(
      /* webpackIgnore: true */
      CDN_ESM
    );
  }
  if (!workerReady) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER;
    workerReady = true;
  }
  return pdfjsLib;
}

/* ---------------- core ---------------- */

function collapse(s) {
  if (!s) return "";
  return s
    .normalize("NFKC")
    .replace(/\u00AD/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractRawPdf(file) {
  const pdfjs = await ensurePdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;

  const pageTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    pageTexts.push(collapse(text));
  }
  const text = pageTexts.join("\n");
  try {
    pdf.cleanup?.();
  } catch {}
  try {
    pdf.destroy?.();
  } catch {}

  return {
    name: file.name,
    size: file.size,
    type: file.type || "application/pdf",
    lastModified: file.lastModified || Date.now(),
    pages: pageTexts.length,
    pageTexts,
    text,
  };
}

export async function extractTextFromPdfs(files) {
  await ensurePdfjs();

  const pdfFiles = Array.from(files || []).filter(
    (f) =>
      (f.type && f.type.toLowerCase() === "application/pdf") ||
      (f.name || "").toLowerCase().endsWith(".pdf")
  );

  const out = [];
  for (const file of pdfFiles) {
    const raw = await extractRawPdf(file);

    const p1 = raw.pageTexts[0] || "";
    const p1U = p1.toUpperCase();
    const all = raw.text;
    const allU = all.toUpperCase();

    const record = {
      fileName: raw.name,
      exporter:
        findCompanyName(all) ||
        findAfter(
          all,
          /EXPORTER'?S NAME(?:\s*&\s*ADDRESS)?\s*/i,
          /[A-Z0-9 .,'&/-]+/i
        ),
      portOfDischarge: extractPortOfDischarge(p1, p1U),
      ...extractSbNoAndDate(p1U),
      pcinNo: extractPcin(allU),
      ...extractGrossWeight(p1U),
      ...extractPackages(p1U, allU),
      hsCode: extractHsCode(raw.pageTexts),
    };

    out.push(record);
  }

  console.log("Structured PDF JSON:", JSON.stringify(out, null, 2));
  return out;
}

/* ---------------- helpers (unchanged) ---------------- */

function findAfter(text, markerRe, valueRe) {
  const m = text.match(markerRe);
  if (!m) return "";
  const start = m.index + m[0].length;
  const slice = text.slice(start);
  const v = slice.match(valueRe);
  return v ? collapse(v[0]) : "";
}

function findCompanyName(t) {
  const re =
    /\b([A-Z][A-Z0-9 '&.-]+?\s(?:LIMITED|LTD\.?|PVT\.?\s*LTD\.?|PRIVATE\s+LIMITED))\b/;
  const m = t.toUpperCase().match(re);
  return m ? tidyCase(t, m[1]) : "";
}
function tidyCase(original, upperToken) {
  const idx = original.toUpperCase().indexOf(upperToken);
  if (idx === -1) return upperToken;
  return original.slice(idx, idx + upperToken.length);
}
function findAfterUntil(text, markerRe, stopRe, maxSpan = 120) {
  const m = text.match(markerRe);
  if (!m) return "";
  const start = m.index + m[0].length;
  const tail = text.slice(start, start + maxSpan);
  const stop = tail.match(stopRe);
  if (stop) return tail.slice(0, stop.index);
  return tail;
}
function extractSbNoAndDate(p1U) {
  const cluster = p1U.match(
    /\bIN[A-Z0-9]+\b\s+(\d{5,})\s+([0-9]{1,2}-[A-Z]{3}-\d{2,4})/
  );
  if (cluster) {
    return { shippingBillNo: cluster[1], sbDate: cluster[2] };
  }
  const sbNo =
    findAfter(p1U, /SB\s*NO[:\-\s]*/i, /\d{5,}/i) ||
    findAfter(p1U, /\bSB#?\s*/i, /\d{5,}/i) ||
    "";
  const sbDate =
    findAfter(p1U, /SB\s*DATE[:\-\s]*/i, /[0-9]{1,2}-[A-Z]{3}-\d{2,4}/i) || "";
  return { shippingBillNo: sbNo, sbDate };
}
function extractPortOfDischarge(p1, p1U) {
  const seg1 = findAfterUntil(
    p1,
    /PORT OF DISCHARGE\s*/i,
    /(?:\b\d{1,2}\.|COUNTRY OF DISCHARGE|TYPE\b|WAREHOUSE|SEALED|PACKAGED)/i,
    150
  );
  const cand1 =
    seg1.match(/\b([A-Z]{3,6}\s*\([A-Za-z .-]+\))/) ||
    seg1.match(/\b([A-Z]{3,6})\b(?!\s*\()/);
  if (cand1 && cand1[1]) return cand1[1].trim();

  const seg2 = findAfterUntil(
    p1,
    /COUNTRY OF DISCHARGE\s*/i,
    /(?:\b\d{1,2}\.|TYPE\b|WAREHOUSE|SEALED|PACKAGED)/i,
    150
  );
  const cand2 =
    seg2.match(/\b([A-Z]{3,6}\s*\([A-Za-z .-]+\))/) ||
    seg2.match(/\b([A-Z]{3,6})\b(?!\s*\()/);
  if (cand2 && cand2[1]) return cand2[1].trim();

  const cand3 = p1.match(/\b([A-Z]{3,6})\s*\(([A-Za-z .-]+)\)/);
  if (cand3 && !/IN[A-Z]{3}\d?/i.test(cand3[0])) return cand3[0];

  return "";
}
function extractPcin(allU) {
  const m1 = allU.match(/\bPCIN\s*NO[#:\-\s]*([A-Z0-9]+)/);
  if (m1) return m1[1];
  const m2 = allU.match(/\b\d{2}PCEG[A-Z0-9]{12,20}\b/);
  if (m2) return m2[0];
  const m3 = allU.match(/\b\d{2}PC[A-Z0-9]{12,22}\b/);
  if (m3) return m3[0];
  return "";
}
function extractGrossWeight(p1U) {
  const m = p1U.match(/(\d{1,10})\s+G\.?WT\s+([A-Z]+)/);
  if (m) return { grossWeight: m[1], weightUnit: m[2] };
  const m2 = p1U.match(/GROSS\s+WEIGHT[^0-9]*([0-9.]+)\s*([A-Z]+)/);
  if (m2) return { grossWeight: m2[1], weightUnit: m2[2] };
  return { grossWeight: "", weightUnit: "" };
}
function extractPackages(p1U, allU) {
  const TYPE = /(UNT|NOS|BAGS?|CTN|PKG|PCS|BOX|PKTS?)/i;
  const ctx =
    sliceAfter(allU, /(NO\.?\s+OF\s+(PACKETS|PACKAGES)|NOS\s+PKG)/i, 80) ||
    sliceAfter(p1U, /(NO\.?\s+OF\s+(PACKETS|PACKAGES)|NOS\s+PKG)/i, 80);
  const m1 = ctx && ctx.match(new RegExp(`\\b(\\d{1,6})\\s+${TYPE.source}`));
  if (m1) return { noOfPackages: m1[1], typeOfPackages: m1[2].toUpperCase() };
  const m2 = p1U.match(new RegExp(`\\b(\\d{1,6})\\s+${TYPE.source}`));
  if (m2) return { noOfPackages: m2[1], typeOfPackages: m2[2].toUpperCase() };
  const m3 =
    allU.match(
      /\bQUANTITY\s*\d*\s*([0-9]+)\s*(UNT|NOS|PCS|BAG|CTN|PKG|BOX)\b/i
    ) || allU.match(new RegExp(`\\b(\\d{1,6})\\s+${TYPE.source}\\b`));
  if (m3) return { noOfPackages: m3[1], typeOfPackages: m3[2].toUpperCase() };
  return { noOfPackages: "", typeOfPackages: "" };
}
function sliceAfter(text, markerRe, span) {
  const m = text.match(markerRe);
  if (!m) return "";
  const start = m.index + m[0].length;
  return text.slice(start, start + span);
}
function extractHsCode(pageTexts) {
  const p2 = (pageTexts[1] || "").toUpperCase();
  const p3 = (pageTexts[2] || "").toUpperCase();
  let m =
    p2.match(/HS\s*CD[^0-9]*\b(\d{8})\b/) ||
    p3.match(/HS\s*CD[^0-9]*\b(\d{8})\b/);
  if (m) return m[1];
  m = p3.match(/\b(\d{8})\b/);
  if (m) return m[1];
  const all = pageTexts.join(" ").toUpperCase();
  m = all.match(/\b(\d{8})\b/);
  return m ? m[1] : "";
}
