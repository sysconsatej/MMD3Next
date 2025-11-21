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
    } catch (_) {}
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
    } catch (_) {}
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
  } catch (_) {}
  pdfjsLib = await loadUmdPair(SELF, CDN_CANDIDATES);
  workerReady = true;
  return pdfjsLib;
}

// ---------------------- Core ----------------------
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

  return { pages: pageTexts.length, pageTexts, text };
}

// ✅ UPDATED FUNCTION: returns { userId, data: [ ... ] } with id, etc.
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
    const all = raw.text;

    const invoiceNo = extractInvoiceNo(all, p1, p2);
    const bookingNo = extractBookingNo(all, p1, p2);
    const issueDate = extractIssueDate(all, p1, p2);
    const dueDate = extractDueDate(all, p1, p2);
    const { vesselName, voyageCode } = extractVesselVoyage(all, p1, p2);

    // still extracted in case you want to use it later
    const customerGST = extractCustomerGST(all, p1, p2);
    const { customerMerged } = extractCustomerMergedAfterBL(all);

    const blNumber = extractBlNumber(all);
    const totalFigure = extractTotalInvoiceFigure(all);
    const freight = detectFreight(all);

    const newFileName = Date.now() + "-" + file.name;
    const modifiedFile = new File([file], newFileName, { type: file.type });

    rows.push({
      invoiceNo,
      invoiceDate: dueDate,
      billingParty: customerMerged,
      totalInvoiceAmount: totalFigure.replace(",", ""),
      tblAttachment: [{ path: modifiedFile }],
      // id: rows.length + 1,
      // fileName: file.name,
      // bookingNo,
      // issueDate,
      // vesselName,
      // voyageCode,
      // blNumber,
      // freight,
      // if later you want GST, just uncomment:
      // customerGST,
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
  const yy = String(y).padStart(4, "0");
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
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

  let m = t.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) {
    const y = Number(m[1]),
      mo = Number(m[2]),
      d = Number(m[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
  m = t.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]),
      mo = Number(m[2]),
      d = Number(m[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
  m = t.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})$/);
  if (m) {
    const d = Number(m[1]),
      mo = Number(m[2]),
      y = normYear(m[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
  m = t.match(/^(\d{1,2})[.\-\/\s]([A-Za-z]{3,})[.\-\/\s](\d{2,4})$/);
  if (m) {
    const d = Number(m[1]),
      mo = MONTHS[m[2].slice(0, 3).toUpperCase()];
    const y = normYear(m[3]);
    if (mo && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
  m = t.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[1].slice(0, 3).toUpperCase()],
      d = Number(m[2]),
      y = Number(m[3]);
    if (mo && d >= 1 && d <= 31) return toISO(y, mo, d);
  }
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

// ---------- Invoice / Booking ----------
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
// ---------- Dates ----------
function extractIssueDate(all, p1, p2) {
  const labels = [
    /(ISSUE\s*DATE|DATE\s*OF\s*ISSUE)/i,
    /(INVOICE\s*DATE|INV\s*DATE)/i,
    /\bDATE\b/i,
  ];
  for (const L of labels) {
    const iso =
      findDateNear(p1, L) || findDateNear(p2, L) || findDateNear(all, L);
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
    const iso =
      findDateNear(p1, L) || findDateNear(p2, L) || findDateNear(all, L);
    if (iso) return iso;
  }
  return "";
}

// ---------- Customer GST ----------
function extractCustomerGST(all, p1, p2) {
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

// ---------- Total Invoice Value (in figure) ----------
function extractTotalInvoiceFigure(all) {
  const m = all.match(
    /Total\s+Invoice\s+Value\s*\(in\s*figure\)\s*([0-9,]+\.\d{2})/i
  );
  return m ? collapse(m[1]) : "";
}

// ---------- Customer merged (Name + Address & PoS) ----------
// ONE invoice layout prints:  [Customer Name, Address & PoS] then a short “SEZ N / Sailing ... B/L Number XXXX”
// then the real name and address lines. We jump to AFTER “B/L Number <code>” and read until ports/next section.
function extractCustomerMergedAfterBL(all) {
  const ANCH = /CUSTOMER\s+NAME,\s*ADDRESS\s*&\s*POS\b/i;
  const anchor = all.match(ANCH);
  if (!anchor) return { customerMerged: "" };

  // Start window at anchor…
  const startIdx = anchor.index ?? 0;
  const rest = all.slice(startIdx);

  // …and jump to AFTER “B/L Number <code>”
  const blMatch = rest.match(/B\/L\s+Number\s+[A-Z0-9\-\/]+/i);
  if (!blMatch) return { customerMerged: "" };
  const afterBL = rest.slice((blMatch.index ?? 0) + blMatch[0].length);

  // Cut off when we hit ports/next section / totals / sequence table
  const STOP =
    /(HAI\s+PHONG|NHAVA\s+SHEVA|VNHPH|INNSA|SEQ\s+CONTAINER|TOTAL\s+INVOICE\s+VALUE|CGST|SGST|IGST|For\s+Payment)/i;
  const block = (afterBL.split(STOP)[0] || afterBL).trim();

  // First uppercase-ish run = name; remainder = addressPoS
  // Then trim address up to “Chembur West,” if present.
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
      // Fallback: first 6–10 words as name
      const words = clean.split(/\s+/);
      name = collapse(words.slice(0, Math.min(10, words.length)).join(" "));
      addr = collapse(words.slice(Math.min(10, words.length)).join(" "));
    }
  }

  // Keep address only up to “Chembur West,” if present
  const stopAddr = addr.match(/(.+?Chembur\s+West,)/i);
  if (stopAddr) addr = collapse(stopAddr[1]);

  // const customerMerged = collapse([name, addr].filter(Boolean).join(" — "));
  const customerMerged = collapse([name].filter(Boolean).join(" — "));

  return { customerMerged };
}
