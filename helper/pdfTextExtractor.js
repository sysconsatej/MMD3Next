// /helper/pdfTextExtractor.js
"use client";
/* eslint-disable */

// ---------------------- PDF.js dynamic loader (self-host + CDN fallbacks) ----------------------
let pdfjsLib = null;
let workerReady = false;

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";
const SELF = {
  esm: `${ORIGIN}/pdfjs/pdf.mjs`,
  workerEsm: `${ORIGIN}/pdfjs/pdf.worker.min.mjs`,
  umd: `${ORIGIN}/pdfjs/pdf.min.js`,
  workerUmd: `${ORIGIN}/pdfjs/pdf.worker.min.js`,
};

const CDN_CANDIDATES = [
  {
    esm: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.mjs",
    workerEsm:
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs",
    umd: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
    workerUmd:
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  },
  {
    esm: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.mjs",
    workerEsm: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs",
    umd: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
    workerUmd: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  },
  {
    esm: null,
    workerEsm: null,
    umd: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    workerUmd:
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  },
];

async function tryImport(url) {
  if (!url) throw new Error("no url");
  return await import(/* webpackIgnore: true */ url);
}

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Script load failed for ${src}`));
    document.head.appendChild(el);
  });
}

async function loadEsmPair(primary, list) {
  const attempts = [{ esm: primary.esm, workerEsm: primary.workerEsm }].concat(
    list
      .filter((c) => c.esm && c.workerEsm)
      .map((c) => ({ esm: c.esm, workerEsm: c.workerEsm }))
  );
  for (const cand of attempts) {
    try {
      const mod = await tryImport(cand.esm);
      const lib = mod?.default ?? mod;
      lib.GlobalWorkerOptions.workerSrc = cand.workerEsm;
      return lib;
    } catch (_) { }
  }
  throw new Error("ESM load failed for all candidates");
}

async function loadUmdPair(primary, list) {
  const attempts = [{ umd: primary.umd, workerUmd: primary.workerUmd }].concat(
    list.map((c) => ({ umd: c.umd, workerUmd: c.workerUmd }))
  );
  for (const cand of attempts) {
    try {
      await injectScript(cand.umd);
      const lib = window.pdfjsLib;
      if (!lib) throw new Error("window.pdfjsLib missing after UMD load");
      lib.GlobalWorkerOptions.workerSrc = cand.workerUmd;
      return lib;
    } catch (_) { }
  }
  throw new Error("UMD load failed for all candidates");
}

async function ensurePdfjs() {
  if (typeof window === "undefined") throw new Error("Browser-only");
  if (pdfjsLib) return pdfjsLib;
  try {
    pdfjsLib = await loadEsmPair(SELF, CDN_CANDIDATES);
    workerReady = true;
    return pdfjsLib;
  } catch (_) { }
  pdfjsLib = await loadUmdPair(SELF, CDN_CANDIDATES);
  workerReady = true;
  return pdfjsLib;
}

// ---------------------- Core ----------------------
function collapse(s) {
  if (!s) return "";
  return s
    .normalize("NFKC")
    .replace(/\u00AD/g, "") // soft hyphen
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
    const text = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    pageTexts.push(collapse(text));
  }
  const text = pageTexts.join("\n");
  try {
    pdf.cleanup?.();
  } catch { }
  try {
    pdf.destroy?.();
  } catch { }

  return { pages: pageTexts.length, pageTexts, text };
}

// ===================================================================
// ✅ MAIN BULK FUNCTION – returns API-ready rows
// ===================================================================
export async function extractTextFromPdfs(files) {
  await ensurePdfjs();

  const pdfFiles = Array.from(files || []).filter(
    (f) =>
      (f.type && f.type.toLowerCase() === "application/pdf") ||
      (f.name || "").toLowerCase().endsWith(".pdf")
  );

  const rows = [];

  for (const file of pdfFiles) {
    const raw = await extractRawPdf(file);
    const p1 = raw.pageTexts[0] || "";
    const p2 = raw.pageTexts[1] || "";
    const all = raw.text || "";

    // -------- Robust multi-pattern extraction --------
    const invoiceNo =
      extractInvoiceNoMulti(all, p1, p2) || extractInvoiceNo(all, p1, p2);
    const issueDateISO = extractIssueDate(all, p1, p2);
    const dueDateISO = extractDueDate(all, p1, p2);

    // Prefer dedicated invoice-date extractor, then fallbacks
    const invoiceDateISO =
      extractInvoiceDateMulti(all, p1, p2) || issueDateISO || dueDateISO || "";

    const { vesselName, voyageCode } = extractVesselVoyage(all, p1, p2);
    const customerGST = extractCustomerGST(all, p1, p2);
    const { customerMerged } = extractCustomerMergedAfterBL(all);

    const blNumber = extractBlNumber(all);

    const totalFromMulti = extractTotalInvoiceAmountMulti(all);
    const totalFromSimple = extractTotalInvoiceFigure(all);
    const totalInvoiceAmount =
      typeof totalFromMulti === "number" && !Number.isNaN(totalFromMulti)
        ? totalFromMulti
        : totalFromSimple
          ? Number(String(totalFromSimple).replace(/,/g, ""))
          : 0;

    const freight = detectFreight(all);

    const invoiceTypeId = detectInvoiceType(all);
    const invoiceCategoryId = extractInvoiceCategoryMulti(all);

    const billingParty =
      extractBillingPartyMulti(all, p1, p2) || customerMerged || "";

    const remarks = detectRemarks(all);

    const newFileName = Date.now() + "-" + file.name;
    const modifiedFile = new File([file], newFileName, { type: file.type });

    rows.push({
      invoiceNo,
      invoiceTypeId,
      totalInvoiceAmount,
      invoiceDate: invoiceDateISO,
      invoiceCategoryId,
      billingParty,
      billingPartyGstinNo: customerGST,
      remarks,
      tblAttachment: [{ path: modifiedFile }],
    });
  }

  return rows;
}

// ---------------------- Helpers ----------------------
function sliceAround(source, anchorRe, spanBefore = 80, spanAfter = 240) {
  const m = source?.match(anchorRe);
  if (!m) return "";
  const i = m.index ?? 0;
  const start = Math.max(0, i - spanBefore);
  return source.slice(start, i + m[0].length + spanAfter);
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v && collapse(v)) return collapse(v);
  }
  return "";
}

// ---------- Dates ----------
const MONTHS = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};
function toISO(y, m, d) {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(
    d
  ).padStart(2, "0")}`;
}

function normYear(y) {
  const s = String(y);
  const n = Number(s);
  if (s.length === 2) return n >= 70 ? 1900 + n : 2000 + n;
  return n;
}
function parseDateFlexible(token) {
  if (!token) return "";
  const t = token.trim();

  let m = t.match(/^(\d{1,2})([A-Za-z]{3})(\d{4})$/);
  if (m) return toISO(m[3], MONTHS[m[2].toUpperCase()], m[1]);

  // ✅ ADDED: dd/Mon/yyyy like 30/Sep/2025 (also 30-Sep-2025, 30 Sep 2025)
  m = t.match(/^(\d{1,2})[.\-\/\s]([A-Za-z]{3})[.\-\/\s](\d{4})$/);
  if (m) return toISO(m[3], MONTHS[m[2].toUpperCase()], m[1]);

  m = t.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);
  if (m) return toISO(m[1], m[2], m[3]);

  m = t.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})$/);
  if (m) return toISO(normYear(m[3]), m[2], m[1]);

  return "";
}
function findDateNear(text, labelRe) {
  if (!text) return "";
  const win = sliceAround(text, labelRe, 10, 160);
  const tokens = []
    .concat(win.match(/\b\d{8}\b/g) || [])
    .concat(win.match(/\b\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2}\b/g) || [])
    .concat(win.match(/\b\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4}\b/g) || [])
    .concat(
      win.match(/\b\d{1,2}[.\-\/\s][A-Za-z]{3,}[.\-\/\s]\d{2,4}\b/g) || []
    )
    .concat(win.match(/\b[A-Za-z]{3,}\s+\d{1,2},\s*\d{4}\b/g) || []);
  for (const t of tokens) {
    const iso = parseDateFlexible(t);
    if (iso) return iso;
  }
  return "";
}

// ---------- Vessel / Voyage ----------
const NEXT_FIELD_GUARD =
  /\s+(INVOICE|BOOKING|CUSTOMER|VESSEL\s*&|VOYAGE|ISSUE|COMMODITY|B\/L|BL\s+NUMBER|PAN|GST|STATE|DUE|CHARGE|AMOUNT|TOTAL)\b/i;

function extractVesselVoyage(all, p1, p2) {
  let win =
    sliceAround(p1, /VESSEL\s*\/\s*VOYAGE/i) ||
    sliceAround(p2, /VESSEL\s*\/\s*VOYAGE/i) ||
    sliceAround(all, /VESSEL\s*\/\s*VOYAGE/i);

  if (win) {
    const m = win.match(
      /VESSEL\s*\/\s*VOYAGE\s*[:#\-]?\s*([A-Z0-9 .,'&\-\/]+?)(?=\s+[;,\-\/]*|$)/i
    );
    if (m) {
      let vessel = collapse(m[1] || "");
      let voyage = "";
      if (vessel.includes("/")) {
        const parts = vessel.split("/").map(collapse).filter(Boolean);
        vessel = parts[0] || vessel;
        voyage = parts[1] || "";
      }
      return { vesselName: vessel, voyageCode: voyage };
    }
  }

  const vWin = firstNonEmpty(
    sliceAround(p1, /\b(VESSEL\s*NAME|VSL\s*NAME|VESSEL)\b/i),
    sliceAround(p2, /\b(VESSEL\s*NAME|VSL\s*NAME|VESSEL)\b/i),
    sliceAround(all, /\b(VESSEL\s*NAME|VSL\s*NAME|VESSEL)\b/i)
  );
  const vMatch =
    vWin.match(
      new RegExp(
        String.raw`(?:VESSEL\s*NAME|VSL\s*NAME|VESSEL)\s*[:#\-]?\s*([A-Z0-9 .,'&\-]+?)(?=${NEXT_FIELD_GUARD.source}|$)`,
        "i"
      )
    ) ||
    all.match(
      new RegExp(
        String.raw`(?:VESSEL\s*NAME|VSL\s*NAME|VESSEL)\s*[:#\-]?\s*([A-Z0-9 .,'&\-]+?)(?=${NEXT_FIELD_GUARD.source}|$)`,
        "i"
      )
    );
  const vesselName = vMatch ? collapse(vMatch[1]) : "";

  const yWin = firstNonEmpty(
    sliceAround(
      p1,
      /\b(VESSEL\s*&\s*VOYAGE\s*CODE|VOYAGE\s*CODE|VOYAGE|VOY|VYG)\b/i
    ),
    sliceAround(
      p2,
      /\b(VESSEL\s*&\s*VOYAGE\s*CODE|VOYAGE\s*CODE|VOYAGE|VOY|VYG)\b/i
    ),
    sliceAround(
      all,
      /\b(VESSEL\s*&\s*VOYAGE\s*CODE|VOYAGE\s*CODE|VOYAGE|VOY|VYG)\b/i
    )
  );
  const voyageMatch =
    yWin.match(
      /(?:VESSEL\s*&\s*VOYAGE\s*CODE|VOYAGE\s*CODE|VOYAGE|VOY|VYG)\s*[:#\-]?\s*([A-Z0-9\-\/]+)/i
    ) ||
    all.match(
      /(?:VESSEL\s*&\s*VOYAGE\s*CODE|VOYAGE\s*CODE|VOYAGE|VOY|VYG)\s*[:#\-]?\s*([A-Z0-9\-\/]+)/i
    );
  const voyageCode = voyageMatch ? collapse(voyageMatch[1]) : "";

  return { vesselName, voyageCode };
}

// ---------- Invoice / Booking (original simple versions) ----------
function extractInvoiceNo(all, p1, p2) {
  const ANCH = /(INVOICE\s*NO\.?|INV\.?\s*NO\.?|INVOICE\s*#|INVOICE\s*NUMBER)/i;
  const win = firstNonEmpty(
    sliceAround(p1, ANCH),
    sliceAround(p2, ANCH),
    sliceAround(all, ANCH)
  );
  const m =
    win.match(
      /(?:INVOICE\s*NO\.?|INV\.?\s*NO\.?|INVOICE\s*#|INVOICE\s*NUMBER)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i
    ) ||
    all.match(
      /(?:INVOICE\s*NO\.?|INV\.?\s*NO\.?|INVOICE\s*#|INVOICE\s*NUMBER)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i
    );
  return m ? collapse(m[1]) : "";
}
function extractBookingNo(all, p1, p2) {
  const ANCH = /(BOOKING\s*NO\.?|BKG\s*NO\.?|BKG\s*#|RESERVATION\s*NO\.?)/i;
  const win = firstNonEmpty(
    sliceAround(p1, ANCH),
    sliceAround(p2, ANCH),
    sliceAround(all, ANCH)
  );
  const m =
    win.match(
      /(?:BOOKING\s*NO\.?|BKG\s*NO\.?|BKG\s*#|RESERVATION\s*NO\.?)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i
    ) ||
    all.match(
      /(?:BOOKING\s*NO\.?|BKG\s*NO\.?|BKG\s*#|RESERVATION\s*NO\.?)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i
    );
  return m ? collapse(m[1]) : "";
}
function detectFreight(txt) {
  return /\bfreight\b/i.test(txt || "") ? "Yes" : "No";
}
// ---------- Dates (original issue/due) ----------
function extractIssueDate(all, p1, p2) {
  const labels = [
    /(ISSUE\s*DATE|DATE\s*OF\s*ISSUE)/i,
    /(INVOICE\s*DATE|INV\s*DATE)/i,
    /\bDATE\b/i,
  ];
  for (const L of labels) {
    const iso = findDateNear(p1, L) || findDateNear(p2, L) || findDateNear(all, L);
    if (iso) return iso;
  }
  const any =
    (p1.match(/\b\d{8}\b/) ||
      p1.match(/\b\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2}\b/) ||
      p1.match(/\b\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4}\b/) ||
      p1.match(/\b\d{1,2}[.\-\/\s][A-Za-z]{3,}[.\-\/\s]\d{2,4}\b/) ||
      p1.match(/\b[A-Za-z]{3,}\s+\d{1,2},\s*\d{4}\b/))?.[0] || "";
  return parseDateFlexible(any) || "";
}
function extractDueDate(all, p1, p2) {
  const labels = [
    /(DUE\s*DATE|PAYMENT\s*DUE|DUE\s*DT\.?)/i,
    /(LAST\s*DATE\s*OF\s*PAYMENT|PAY\s*BY)/i,
  ];
  for (const L of labels) {
    const iso = findDateNear(p1, L) || findDateNear(p2, L) || findDateNear(all, L);
    if (iso) return iso;
  }
  return "";
}

// ---------- Customer GST ----------
function extractCustomerGST(all, p1, p2) {
  // ✅ ADDED: handle invoices that use "GST No." / "GSTIN" instead of "CUSTOMER GST"
  const srcs = [p1 || "", p2 || "", all || ""];
  for (const src of srcs) {
    const mm =
      src.match(
        /\bGST\s*(?:IN|NO\.?|NO)\s*[:#\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i
      ) || src.match(/\bGST\s*No\.\s*[:#\-]?\s*([A-Z0-9]{15})\b/i);
    if (mm) return collapse(mm[1]);
  }

  const win = firstNonEmpty(
    sliceAround(p1, /\bCUSTOMER\s+GST\b/i),
    sliceAround(p2, /\bCUSTOMER\s+GST\b/i),
    sliceAround(all, /\bCUSTOMER\s+GST\b/i)
  );
  let m =
    win.match(/\bCUSTOMER\s+GST\b\s*[:#\-]?\s*([A-Z0-9]{15})/i) ||
    all.match(/\bCUSTOMER\s+GST\b\s*[:#\-]?\s*([A-Z0-9]{15})/i);
  if (m) return collapse(m[1]);

  const near = sliceAround(all, /\bCUSTOMER\b/i);
  m = near.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i);
  return m ? collapse(m[1]) : "";
}

// ---------- B/L Number ----------
function extractBlNumber(all) {
  const m =
    all.match(/\bB\/L\s+Number\s+([A-Z0-9\-\/]+)\b/i) ||
    all.match(/\bBL\s+Number\s+([A-Z0-9\-\/]+)\b/i);
  return m ? collapse(m[1]) : "";
}

// ---------- Total Invoice Value (simple figure) ----------
function extractTotalInvoiceFigure(all) {
  const m = all.match(
    /Total\s+Invoice\s+Value\s*\(in\s*figure\)\s*([-0-9,]+\.\d{2})/i
  );
  return m ? collapse(m[1]) : "";
}

// ---------- Customer merged (Name + Address & PoS) ----------
function extractCustomerMergedAfterBL(all) {
  const ANCH = /CUSTOMER\s+NAME,\s*ADDRESS\s*&\s*POS\b/i;
  const anchor = all.match(ANCH);
  if (!anchor) return { customerMerged: "" };

  const startIdx = anchor.index ?? 0;
  const rest = all.slice(startIdx);

  const blMatch = rest.match(/B\/L\s+Number\s+[A-Z0-9\-\/]+/i);
  if (!blMatch) return { customerMerged: "" };
  const afterBL = rest.slice((blMatch.index ?? 0) + blMatch[0].length);

  const STOP =
    /(HAI\s+PHONG|NHAVA\s+SHEVA|VNHPH|INNSA|SEQ\s+CONTAINER|TOTAL\s+INVOICE\s+VALUE|CGST|SGST|IGST|For\s+Payment)/i;
  const block = (afterBL.split(STOP)[0] || afterBL).trim();

  let name = "";
  let addr = "";
  const clean = collapse(block);
  if (clean) {
    const nameMatch = clean.match(/\b([A-Z][A-Z0-9 '&.,\-()]{6,})\b/);
    if (nameMatch) {
      name = collapse(nameMatch[1]);
      addr = collapse(
        clean.slice(clean.indexOf(nameMatch[0]) + nameMatch[0].length)
      );
    } else {
      const words = clean.split(/\s+/);
      name = collapse(words.slice(0, Math.min(10, words.length)).join(" "));
      addr = collapse(words.slice(Math.min(10, words.length)).join(" "));
    }
  }

  const stopAddr = addr.match(/(.+?Chembur\s+West,)/i);
  if (stopAddr) addr = collapse(stopAddr[1]);

  const customerMerged = collapse([name].filter(Boolean).join(" — "));

  return { customerMerged };
}

// ===================================================================
// ✅ NEW: MULTI-PATTERN / ROBUST FIELD EXTRACTORS
// ===================================================================

// Invoice number (Invoice / Bill of Supply / Credit Note)
function extractInvoiceNoMulti(all, p1, p2) {
  const patterns = [
    /(INVOICE\s*NO\.?|INV\.?\s*NO\.?|INVOICE\s*NUMBER|INVOICE\s*#)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i,
    /(BILL\s*OF\s*SUPPLY\s*NO\.?)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i,
    /(CREDIT\s*NOTE\s*NO\.?)\s*[:#\-]?\s*([A-Z0-9\/.\-_]+)/i,
  ];
  const sources = [p1, p2, all];
  for (const src of sources) {
    for (const re of patterns) {
      const m = src.match(re);
      if (m) return collapse(m[2]);
    }
  }
  return "";
}

// Multi-pattern invoice date (prefers near labels)
function extractInvoiceDateMulti(all, p1, p2) {
  if (!all) return "";
  const text = all.toUpperCase().replace(/\s+/g, " ");

  let m = text.match(/APPLICATION\s*DATE\s*[:\-]?\s*(\d{1,2}[A-Z]{3}\d{4})/);
  if (m) return parseDateFlexible(m[1]);

  m = text.match(/ACKDATE\s*[:\-]?\s*(\d{1,2}[A-Z]{3}\d{4})/);
  if (m) return parseDateFlexible(m[1]);

  m =
    text.match(/INVOICE\s*DATE\s*[:\-]?\s*([0-9A-Z\/.\-]+)/) ||
    text.match(/ISSUE\s*DATE\s*[:\-]?\s*([0-9A-Z\/.\-]+)/);
  if (m) return parseDateFlexible(m[1]);

  const any =
    text.match(/\b\d{1,2}[A-Z]{3}\d{4}\b/) ||
    text.match(/\b\d{4}[.\-\/]\d{2}[.\-\/]\d{2}\b/);

  return any ? parseDateFlexible(any[0]) : "";
}

// Total invoice amount with multiple patterns, positive/negative
function extractTotalInvoiceAmountMulti(all) {
  if (!all) return 0;

  // 1) Strong explicit labels (keep these)
  const labeled = [
    /Total\s+Invoice\s+Value\s*\(in\s*figure\)\s*₹?\s*([-0-9,]+\.\d{2})/i,
    /Grand\s+Total\s*[:#\-]?\s*₹?\s*([-0-9,]+\.\d{2})/i,
    /Total\s+Amount\s*[:#\-]?\s*₹?\s*([-0-9,]+\.\d{2})/i,
  ];

  for (const re of labeled) {
    const m = all.match(re);
    if (m?.[1]) {
      const num = Number(String(m[1]).replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
  }

  // 2) BEST: "Total" table row -> take LAST amount on that row
  // Works when line breaks exist
  const totalLines = all.match(/(?:^|\n)\s*Total\b[^\n]*$/gim) || [];
  for (let i = totalLines.length - 1; i >= 0; i--) {
    const line = totalLines[i];

    // ignore header-ish lines like "Total Amt With Tax (INR)"
    if (/\b(AMT|AMOUNT)\b.*\bTAX\b/i.test(line) || /\bWITH\s+TAX\b/i.test(line)) continue;

    const amts = line.match(/[-0-9,]+\.\d{2}/g) || [];
    if (amts.length) {
      const num = Number(String(amts[amts.length - 1]).replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
  }

  // 3) If PDF collapses everything into one line:
  // Match: "Total 2,000.00 180.00 180.00 2,360.00" and stop near typical next sections
  const oneLine = all.match(
    /\bTotal\b(?:\s+[A-Z]{3})?(?:\s+₹?\s*[-0-9,]+\.\d{2}){1,10}(?=\s+(?:Amount\s+In\s+Words|HSN\/SAC|Remarks\b|Bank\s+Details|For\s+[A-Z]|Authorised\s+Signatory|E\.\s*&\s*O\.E\.|$))/i
  );
  if (oneLine) {
    const amts = oneLine[0].match(/[-0-9,]+\.\d{2}/g) || [];
    if (amts.length) {
      const num = Number(String(amts[amts.length - 1]).replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
  }

  return 0;
}


// ✅ FINAL INVOICE CATEGORY DETECTION (BUSINESS RULE BASED)
function extractInvoiceCategoryMulti(all) {
  if (!all) return "LOCAL CHARGES";

  const text = all.toUpperCase();

  // ✅ Highest priority: DETENTION
  if (text.includes("DETENTION")) {
    return "DETENTION";
  }

  // ✅ Next priority: FREIGHT
  if (text.includes("FREIGHT")) {
    return "FREIGHT";
  }

  // ✅ Default
  return "LOCAL CHARGES";
}

// Billing party multi-pattern
// ✅ FINAL & STRICT BILLING PARTY + ADDRESS EXTRACTOR
function extractBillingPartyMulti(all, p1, p2) {
  if (!all) return "";

  // 🔹 1️⃣ Strongest Anchor: "Customer Name, Address & PoS"
  let block =
    all.match(
      /Customer\s+Name,\s*Address\s*&\s*PoS\s*([\s\S]+?)\s*(BKG|Booking|Sailing|Arrival|Due\s+Date|TAX\s+INVOICE|BILL\s+OF\s+SUPPLY)/i
    )?.[1] || "";

  // 🔹 2️⃣ Fallback: "Billed To"
  if (!block) {
    block =
      all.match(
        /Billed\s+To\s*[:\-]?\s*([\s\S]+?)\s*(BKG|Booking|Sailing|Arrival|Due\s+Date|TAX\s+INVOICE|BILL\s+OF\s+SUPPLY)/i
      )?.[1] || "";
  }

  block = collapse(block);

  block = block.replace(/\(([^)]*)\)/g, (_full, inside) => {
    const s = String(inside || "").trim();
    if (/[0-9,]/.test(s)) return "";      // drop ( ... ) if has number or comma
    return `(${s})`;                      // keep clean (INDIA)
  });

  block = collapse(block);

  const cut = block.match(
    /^(.*?)(?=\s*(?:,|\||\b(?:ROOM|RM|FLAT|PLOT|SHOP|OFFICE|BLDG|BUILDING|FLOOR|FLR|ROAD|RD\.?|STREET|SECTOR|NAGAR|PIN|PO|POST|DIST|TAL|CITY|STATE)\b(?:\s*(?:NO|NO\.)\s*[-:]?\s*\d+)?|\b(?:NO|NO\.)\s*[-:]?\s*\d+\b|\b[A-Z]{1,3}\s*[-\/]\s*\d+[A-Z]?\b|\b\d{1,2}(?:ST|ND|RD|TH)\b))/i
  );


  block = (cut?.[1] || block).trim();
  block = block.replace(/[|,]\s*$/g, "").trim();

  if (!block) return "";


  // 🔹 4️⃣ Remove PAN/GST if they sneak in
  block = block
    .replace(/\bPAN\b.*$/i, "")
    .replace(/\bGST\b.*$/i, "")
    .replace(/\bBKG\b.*$/i, "")
    .replace(/\bSAILING\b.*$/i, "")
    .replace(/\bDUE\s+DATE\b.*$/i, "")

    // ✅ ADDED: stop at PoS / IRN / Invoice fields (common in e-invoice PDFs)
    .replace(/\bPLACE\s+OF\s+SUPPLY\b.*$/i, "")
    .replace(/\bPOS\b.*$/i, "")
    .replace(/\bIRN\b.*$/i, "")
    .replace(/\bIRN\s*NO\.?\b.*$/i, "")
    .replace(/\bINVOICE\s*NO\.?\b.*$/i, "")
    .replace(/\bINVOICE\s*DATE\b.*$/i, "")
    .replace(/\bACK\s*NO\.?\b.*$/i, "")
    .replace(/\bACK\s*DATE\b.*$/i, "")

    .trim();


  // 🔹 5️⃣ Final format normalization
  block = block.replace(/\s*\(\s*/g, " (");
  block = block.replace(/\s*\)\s*/g, ") ");

  return collapse(block);
}

// Invoice type detection
// ---------- Invoice type detection (from PDF HEADER only)
// ---------- ✅ FINAL Invoice Type Detection (Header + Body + Amount Safe)
// ---------- ✅ FINAL Invoice Type Detection (With Default = TAX INVOICE)
function detectInvoiceType(all) {
  if (!all) return "TAX INVOICE"; // ✅ default safeguard

  const text = all.toUpperCase();

  // ✅ Highest Priority: CREDIT NOTE
  if (
    text.includes("CREDIT NOTE") ||
    text.includes("BILL OF SUPPLY(CREDIT NOTE)") ||
    text.includes("BILL OF SUPPLY (CREDIT NOTE)")
  ) {
    return "Credit Note";
  }

  // ✅ PROFORMA
  if (text.includes("PROFORMA")) {
    return "Proforma";
  }

  // ✅ TAX INVOICE (explicit)
  if (text.includes("TAX INVOICE")) {
    return "TAX INVOICE";
  }

  // ✅ ✅ DEFAULT: if NOTHING matches → TAX INVOICE
  return "TAX INVOICE";
}

// Remarks detection based on content
function detectRemarks(all) {
  if (!all) return "";

  // ✅ 1) First try: extract the actual "Remarks :" text block
  const m = all.match(
    /Remarks?\s*[:\-]?\s*([\s\S]*?)(?=\s*(Bank\s+Details|Account\s+Name|For\s+[A-Z]|Authorised\s+Signatory|E\.\s*&\s*O\.E\.|Terms\s+And\s+Conditions|This\s+is\s+a\s+computer\s+generated|$))/i
  );
  if (m && m[1]) return collapse(m[1]);

  // // ✅ 2) Fallback: your old keyword mapping
  // if (/ADDITIONAL\s+STORAGE/i.test(all)) return "ADDITIONAL STORAGE CHARGES";
  // if (/CREDIT\s+NOTE/i.test(all)) return "CREDIT NOTE";
  // if (/FREIGHT/i.test(all)) return "FREIGHT";

  return "";
}
