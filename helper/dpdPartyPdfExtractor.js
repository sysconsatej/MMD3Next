// /helper/dpdPartyPdfExtractor.js
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
            if (!lib?.getDocument) throw new Error("getDocument not found in ESM lib");
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
            if (!lib?.getDocument) throw new Error("window.pdfjsLib missing after UMD load");
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

// ---------------------- Main Extractor ----------------------
export async function extractDpdPartiesFromPdfs(fileList) {
    if (typeof window === "undefined") return [];

    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return [];

    const pdfjs = await ensurePdfjs();
    if (!pdfjs?.getDocument) return [];

    const normalizeLine = (s) => String(s || "").replace(/\s+/g, " ").trim();

    const buildLinesFromTextContent = (textContent) => {
        const items = (textContent?.items || []).filter(
            (it) => it && typeof it.str === "string"
        );
        const lineMap = new Map();

        for (const it of items) {
            const str = normalizeLine(it.str);
            if (!str) continue;

            const tr = it.transform || [];
            const x = Number(tr[4] ?? 0);
            const y = Number(tr[5] ?? 0);

            // group by y (rounded) to rebuild lines
            const yKey = Math.round(y * 2) / 2;

            if (!lineMap.has(yKey)) lineMap.set(yKey, []);
            lineMap.get(yKey).push({ x, str });
        }

        const ys = Array.from(lineMap.keys()).sort((a, b) => b - a);
        const lines = [];
        for (const y of ys) {
            const parts = lineMap.get(y) || [];
            parts.sort((a, b) => a.x - b.x);
            const line = normalizeLine(parts.map((p) => p.str).join(" "));
            if (line) lines.push(line);
        }
        return lines;
    };

    const extractedDocs = [];

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const allLines = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageLines = buildLinesFromTextContent(textContent);
            allLines.push(...pageLines, "");
        }

        try {
            pdf.cleanup?.();
        } catch { }
        try {
            pdf.destroy?.();
        } catch { }

        extractedDocs.push({
            fileName: file.name,
            text: allLines.join("\n"),
        });
    }

    const rawText = extractedDocs.map((d) => d.text || "").join("\n");
    const text = String(rawText || "")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const isDPD = (s) => /^[A-Z]\d{3}$/i.test(s || "");
    const isPAN = (s) => /^[A-Z]{5}\d{4}[A-Z]$/i.test(s || "");
    const isIEC = (s) => /^(\d{9,12}|[A-Z]{5}\d{4}[A-Z])$/i.test(s || "");

    const cleanedLines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => !/^Sr\.?\s*No\b/i.test(l))
        .filter((l) => !/^Name\s+DPD\b/i.test(l))
        .filter((l) => !/^List of DPD parties\b/i.test(l))
        .filter(
            (l) =>
                !/^From\s+\d{2}-\d{2}-\d{4}\s+To\s+\d{2}-\d{2}-\d{4}\b/i.test(l)
        );

    const parsedRows = [];
    let cur = null;

    const eatTailTokens = (tokens, state) => {
        for (let i = tokens.length - 1; i >= 0; i--) {
            const t = tokens[i];
            if (!state.iecCode && isIEC(t)) {
                state.iecCode = t;
                tokens.splice(i, 1);
                continue;
            }
            if (!state.panNumber && isPAN(t)) {
                state.panNumber = t;
                tokens.splice(i, 1);
                continue;
            }
            if (!state.dpdCode && isDPD(t)) {
                state.dpdCode = t;
                tokens.splice(i, 1);
                continue;
            }
        }
        return tokens;
    };

    const flush = () => {
        if (!cur) return;
        const name = normalizeLine((cur.nameParts || []).join(" "));

        const ok =
            Number.isFinite(cur.srNo) &&
            name &&
            isDPD(cur.dpdCode) &&
            isPAN(cur.panNumber) &&
            (cur.iecCode ? isIEC(cur.iecCode) : true);

        if (ok) {
            parsedRows.push({
                srNo: cur.srNo,
                partyName: name,
                dpdCode: String(cur.dpdCode || "").toUpperCase(),
                panNo: String(cur.panNumber || "").toUpperCase(),
                iecCode: String(cur.iecCode || ""),
            });
        }
        cur = null;
    };

    for (const line of cleanedLines) {
        const m = line.match(/^(\d{1,6})\s+(.*)$/);
        if (m) {
            flush();
            cur = { srNo: Number(m[1]), nameParts: [], dpdCode: "", panNumber: "", iecCode: "" };
            const tokens = m[2].split(" ").filter(Boolean);
            eatTailTokens(tokens, cur);
            const nm = normalizeLine(tokens.join(" "));
            if (nm) cur.nameParts.push(nm);
            continue;
        }

        if (!cur) continue;
        const tokens = line.split(" ").filter(Boolean);
        eatTailTokens(tokens, cur);
        const leftover = normalizeLine(tokens.join(" "));
        if (leftover) cur.nameParts.push(leftover);
    }

    flush();
    return parsedRows;
}
