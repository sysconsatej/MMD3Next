export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------- utils -------------------------------- */
async function readBufferFromFormData(request) {
  const formData = await request.formData();
  const pdfFile = formData.get("pdf");
  if (!pdfFile) throw new Error("no_file");
  const arrayBuffer = await pdfFile.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function loadPdfParse() {
  try {
    const m = await import("pdf-parse");
    return m.default ?? m;
  } catch (e1) {
    try {
      const m = await import("pdf-parse/lib/pdf-parse.js");
      return m.default ?? m;
    } catch (e2) {
      throw new Error(
        `pdf-parse-load-failed: ${e1?.message || e1} | ${e2?.message || e2}`
      );
    }
  }
}

async function extractWithPdfParse(buffer) {
  const pdfParse = await loadPdfParse();
  const data = await pdfParse(buffer);
  return typeof data?.text === "string" ? data.text : "";
}

async function extractWithPdfReader(buffer) {
  const { PdfReader } = await import("pdfreader");
  return await new Promise((resolve, reject) => {
    const pages = new Map();
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) return reject(err);
      if (!item) {
        const out = [...pages.keys()]
          .sort((a, b) => a - b)
          .map((p) =>
            pages
              .get(p)
              .sort((a, b) => a.y - b.y || a.x - b.x)
              .map((t) => t.text)
              .join(" ")
          )
          .join("\n");
        return resolve(out);
      }
      if (item.page) {
        if (!pages.has(item.page)) pages.set(item.page, []);
      } else if (item.text) {
        const p = item.page || 1;
        if (!pages.has(p)) pages.set(p, []);
        pages.get(p).push({ x: item.x || 0, y: item.y || 0, text: item.text });
      }
    });
  });
}

/* --------------------------- normalization --------------------------- */
function normalizePdfText(raw) {
  if (!raw) return "";
  let t = raw;

  // collapse spaces
  t = t.replace(/[ \t]+/g, " ");

  // join split letters into words (Invoice / O C E A N)
  t = t.replace(/\b(?:[A-Za-z]{1,3}\s){3,}[A-Za-z]{1,3}\b/g, (m) =>
    m.replace(/\s+/g, "")
  );
  t = t.replace(/\b(?:[A-Z]\s){3,}[A-Z]\b/g, (m) => m.replace(/\s+/g, ""));

  // join letter–digit and digit–letter splits (e.g., OART 0073 W → OART0073W)
  t = t.replace(/([A-Z])\s+(\d)/g, "$1$2");
  t = t.replace(/(\d)\s+([A-Z])/g, "$1$2");
  // compact alternating short chunks inside a small window
  t = t.replace(/\b([A-Z0-9](?:\s[A-Z0-9]){4,})\b/g, (m) =>
    m.replace(/\s+/g, "")
  );

  // common labels
  t = t
    .replace(/B\s*\/\s*L/gi, "BL")
    .replace(/C\s*G\s*S\s*T/gi, "CGST")
    .replace(/S\s*G\s*S\s*T/gi, "SGST")
    .replace(/U\s*G\s*S\s*T/gi, "UGST")
    .replace(/I\s*G\s*S\s*T/gi, "IGST");

  // join code-like tokens
  t = t.replace(
    /\b([A-Z]{2,})\s+([0-9][0-9\s]{3,})\b/g,
    (_, a, b) => a + b.replace(/\s+/g, "")
  );
  t = t.replace(
    /\b([A-Z]{3,})\s+([0-9][0-9\s]{2,})\b/g,
    (_, a, b) => a + b.replace(/\s+/g, "")
  );

  // normalise PAN / GST even if spaced
  t = t.replace(/\b(?:[A-Z]\s?){5}(?:\d\s?){4}[A-Z]\b/g, (m) =>
    m.replace(/\s+/g, "")
  ); // PAN
  t = t.replace(
    /\b(?:\d\s?){2}(?:[A-Z]\s?){5}(?:\d\s?){4}[A-Z]\s?\d\s?[Zz]\s?[A-Z0-9]\b/g,
    (m) => m.replace(/\s+/g, "")
  ); // GST

  // numbers
  t = t.replace(/(\d),\s+(\d{3})/g, "$1,$2");
  t = t.replace(/(\d)\s*\.\s*(\d{2})\b/g, "$1.$2");
  t = t.replace(/\s+([,/:)])/g, "$1");

  // canonical labels for anchors
  t = t
    .replace(/Invoice\s*No/gi, "Invoice No")
    .replace(/Booking\s*No/gi, "Booking No")
    .replace(/Issue\s*date/gi, "Issue date")
    .replace(/Due\s*date/gi, "Due date")
    .replace(/Voyage\s*Code/gi, "Voyage Code")
    .replace(/Vessel\s*Name/gi, "Vessel Name")
    .replace(/SGST\s*\/\s*UGST\s*INR/gi, "SGST/UGST INR")
    .replace(/CGST\s*INR/gi, "CGST INR")
    .replace(/IGST\s*INR/gi, "IGST INR")
    .replace(
      /Total\s*Invoice\s*Value\s*\(in\s*figure\)/gi,
      "Total Invoice Value (in figure)"
    )
    .replace(
      /Total\s*Invoice\s*Value\s*\(in\s*words\)/gi,
      "Total Invoice Value (in words)"
    );

  return t.trim();
}

/* ------------------------------ helpers ------------------------------ */
const compact = (s) => (s || "").replace(/\s+/g, "");
const firstMatch = (re, s) => (s.match(re)?.[1] || "").trim();
const getAll = (re, s) => [...s.matchAll(re)].map((m) => m[1]);

function sliceAfter(label, s, win = 160) {
  const i = s.toLowerCase().indexOf(label.toLowerCase());
  if (i < 0) return "";
  let snip = s.slice(i + label.length, i + label.length + win);
  const stopper =
    /\b(For|Online|payments|NEFT|Issue|Due|PAN|State|Code|office|Voyage|Remarks|Customer|Address|Ack|Total|Containers|Description|Declaration)\b/i;
  const m = snip.match(stopper);
  if (m) snip = snip.slice(0, m.index);
  return snip.trim();
}

/* dates */
function formatDDMonYYToSql(s) {
  if (!s) return "";
  const M = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };
  const m = s.trim().match(/^(\d{2})([A-Za-z]{3})(\d{2})$/);
  if (!m) return "";
  const dd = m[1];
  const mm = M[m[2].toUpperCase()] || "01";
  const yy = m[3];
  const yyyy = Number(yy) <= 49 ? `20${yy}` : `19${yy}`;
  return `${yyyy}-${mm}-${dd} 00:00:00.000`;
}
function formatYYYYMMDDToSql(s) {
  const v = (s || "").replace(/\D/g, "");
  if (v.length < 8) return "";
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)} 00:00:00.000`;
}

/* code pickers */
function pickYYYYMMDD(s) {
  const m = s.match(/([\d\s]{8,10})/);
  if (!m) return "";
  const only = m[1].replace(/\D/g, "");
  return only.length >= 8 ? only.slice(0, 8) : "";
}
function pickInvoiceCode(s) {
  const c = compact(s).replace(/[^A-Z0-9]/gi, "");
  const m = c.match(/[A-Z]{2,}\d{6,}/);
  return m ? m[0] : "";
}
function pickBookingCode(s) {
  const c = (s || "").replace(/[^A-Z0-9]/gi, "");
  const m = c.match(/([A-Z]{3,}[A-Z]*\d{5,})(?=[A-Z]|$)/);
  return m ? m[1] : "";
}

/* PAN/GST */
const PAN_RE = /\b([A-Z]{5}\d{4}[A-Z])\b/g;
const GST_RE = /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Zz][A-Z0-9])\b/g;

function pickCustomerGST(text) {
  const all = getAll(GST_RE, text);
  if (!all.length) return "";
  // supplier GST first, customer later → take the last
  return all[all.length - 1];
}
function pickCustomerPAN(text, gst) {
  // 1) try a "Customer ..." window
  const custWin = sliceAfter("Customer", text, 400);
  const custPAN = firstMatch(/\b([A-Z]{5}\d{4}[A-Z])\b/, custWin);
  if (custPAN) return custPAN;

  // 2) derive from GST if present
  if (gst && gst.length >= 15) return gst.slice(2, 12);

  // 3) otherwise prefer the last PAN that differs from the first (supplier)
  const all = getAll(PAN_RE, text);
  if (!all.length) return "";
  if (all.length === 1) return all[0];
  const supplier = all[0];
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i] !== supplier) return all[i];
  }
  return all[all.length - 1];
}

/* Voyage code (no word boundaries; excludes PAN) */
function pickVoyageCode(text) {
  const PAN_SHAPE = /^[A-Z]{5}\d{4}[A-Z]$/;

  // collect candidates from windows and globally; DO NOT require word boundaries
  const pools = [
    sliceAfter("Voyage Code", text, 160),
    sliceAfter("Vessel Name", text, 240),
    sliceAfter("Booking No", text, 240),
  ];

  const collect = (src) => {
    const found = [];
    // prefer O/0ART…
    found.push(...getAll(/((?:O|0)ART\d{3,6}[A-Z])/g, src));
    // broad: letters 2–6 + digits 3–6 + letter
    found.push(...getAll(/([A-Z]{2,6}\d{3,6}[A-Z])/g, src));
    return found;
  };

  let candidates = [];
  pools.forEach((p) => (candidates = candidates.concat(collect(p))));
  if (!candidates.length) candidates = candidates.concat(collect(text));

  // filter out PAN-shape
  candidates = candidates.filter((t) => !PAN_SHAPE.test(t));

  if (!candidates.length) return "";

  // score and choose
  const score = (t) => {
    let s = 0;
    if (/^(?:O|0)ART\d{3,6}[A-Z]$/.test(t)) s += 5;
    if (/[A-Z]{3,}\d{3,6}[A-Z]/.test(t)) s += 3;
    s += Math.min(2, Math.floor(t.length / 6));
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  // if token starts with 0ART, turn leading 0 into O
  const v = candidates[0].replace(/^0ART/, "OART");
  return v;
}

/* vessel name */
function normalizeVesselName(raw) {
  let v = (raw || "").trim().replace(/\s{2,}/g, " ");
  v = v
    .split(
      /Invoice\s*No|Booking\s*No|Due\s*date|Issue\s*date|Voyage\s*Code/i
    )[0]
    .trim();
  if (/^ONE[A-Z]{3,}$/.test(v)) return `ONE ${v.slice(3)}`;
  if (/^[A-Z]{6,}$/.test(v) && !v.includes(" ")) {
    return `${v.slice(0, v.length - 5)} ${v.slice(v.length - 5)}`.trim();
  }
  return v;
}

// last currency in a snippet
function lastCurrencyIn(s) {
  const fixed = s.replace(/(\d),\s+(\d{3})/g, "$1,$2");
  const m = [...fixed.matchAll(/([\d][\d,\s]*\.\d{2})/g)];
  return m.length ? compact(m[m.length - 1][1]) : "0.00";
}

/* --------------------------- field extractor --------------------------- */
function extractFields(text) {
  // Invoice
  const invSnip = sliceAfter("Invoice No", text);
  const invoiceNo = pickInvoiceCode(invSnip);

  // Booking
  const bookSnip = sliceAfter("Booking No", text);
  const bookingNo = pickBookingCode(bookSnip);

  // Dates
  const issueSnip = sliceAfter("Issue date", text, 40);
  const issueToken =
    firstMatch(/\b(\d{2}[A-Za-z]{3}\d{2})\b/, issueSnip) ||
    compact(firstMatch(/\b([0-9A-Za-z][0-9A-Za-z\s]{5,9})\b/, issueSnip));
  const issueDate = formatDDMonYYToSql((issueToken || "").replace(/\s+/g, ""));

  const dueSnip = sliceAfter("Due date", text, 40);
  const dueDate = formatYYYYMMDDToSql(pickYYYYMMDD(dueSnip));

  // Vessel
  const vesselName = normalizeVesselName(sliceAfter("Vessel Name", text, 80));

  // Customer GST & PAN
  const customerGST = pickCustomerGST(text);
  const customerPAN = pickCustomerPAN(text, customerGST);

  // State code
  let stateCode = firstMatch(/\bState\s*Code\s*(\d{2})\b/i, text);
  if (!stateCode && customerGST) stateCode = customerGST.slice(0, 2);

  // Voyage code
  const voyageCode = pickVoyageCode(text);

  // Taxes
  const cgstValue = lastCurrencyIn(sliceAfter("CGST INR", text));
  const sgstValue = lastCurrencyIn(sliceAfter("SGST/UGST INR", text));
  const igstValue = lastCurrencyIn(sliceAfter("IGST INR", text));

  // Totals
  const totalFigure = compact(
    firstMatch(
      /\bTotal\s*Invoice\s*Value\s*\(in figure\)\s*([\d,\s]+\.\d{2})\b/i,
      text
    )
  );
  const totalWords = firstMatch(
    /\bTotal\s*Invoice\s*Value\s*\(in words\)\s*(.+?)\s*(?:Amount of tax|CGST|SGST|IGST|Other Cess|$)/i,
    text
  )
    .replace(/\s+/g, " ")
    .trim();

  // Taxable value – fallback near TOTAL
  let taxableValue = compact(
    firstMatch(/\bTaxable\s*Value\s*([\d,\s]+\.\d{2})\b/i, text)
  );
  if (!taxableValue) {
    const nearTotal = sliceAfter("TOTAL", text, 220);
    const firstCurrency = compact(
      firstMatch(/([\d][\d,\s]*\.\d{2})/, nearTotal)
    );
    if (firstCurrency) taxableValue = firstCurrency;
  }

  return {
    invoiceNo,
    bookingNo,
    issueDate,
    dueDate,
    vesselName,
    voyageCode,
    customerPAN,
    customerGST,
    stateCode,
    taxableValue,
    cgstValue,
    sgstValue,
    igstValue,
    totalFigure,
    totalWords,
  };
}

/* ------------------------------- handlers ------------------------------- */
export async function POST(request) {
  try {
    const buffer = await readBufferFromFormData(request);

    let engine = "";
    let raw = "";
    try {
      raw = await extractWithPdfParse(buffer);
      engine = "pdf-parse";
    } catch (e) {
      console.error("pdf-parse failed:", e);
    }
    if (!raw || raw.trim() === "") {
      try {
        raw = await extractWithPdfReader(buffer);
        engine = "pdfreader";
      } catch (e) {
        console.error("pdfreader failed:", e);
        return Response.json(
          {
            ok: false,
            error: "fallback_failed",
            details: String(e?.message || e),
          },
          { status: 500 }
        );
      }
    }
    if (!raw || raw.trim() === "") {
      return Response.json(
        { ok: false, error: "empty_output" },
        { status: 422 }
      );
    }

    const text = normalizePdfText(raw);
    const fields = extractFields(text);

    return Response.json({ ok: true, engine, text, fields }, { status: 200 });
  } catch (err) {
    const msg = String(err?.message || err);
    const status = msg === "no_file" ? 400 : 500;
    return Response.json(
      { ok: false, error: "extract_failed", details: msg },
      { status }
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, message: "extractPdf up" }, { status: 200 });
}
