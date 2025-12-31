"use client";

export async function extractDpdPartiesFromPdfs(fileList) {
    if (typeof window === "undefined") return [];

    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return [];

    let pdfjsMod;
    try {
        pdfjsMod = await import("pdfjs-dist/legacy/build/pdf");
    } catch {
        pdfjsMod = await import("pdfjs-dist/legacy/build/pdf.js");
    }

    const pdfjsLib = pdfjsMod?.getDocument ? pdfjsMod : pdfjsMod?.default;
    if (!pdfjsLib?.getDocument) return [];

    try {
        const workerMod = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
        const workerSrc = workerMod?.default || workerMod;
        if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        }
    } catch {
        // fallback (if worker import fails for some reason)
        if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            const ver = pdfjsLib.version || "3.11.174";
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.js`;
        }
    }

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
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const allLines = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageLines = buildLinesFromTextContent(textContent);
            allLines.push(...pageLines, "");
        }

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
        .filter((l) => !/^From\s+\d{2}-\d{2}-\d{4}\s+To\s+\d{2}-\d{2}-\d{4}\b/i.test(l));

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
