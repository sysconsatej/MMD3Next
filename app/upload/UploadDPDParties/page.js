"use client";

import React, { useMemo, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { theme } from "@/styles";
import FormHeading from "@/components/formHeading/formHeading";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import TableGrid from "@/components/tableGrid/tableGrid";
import MultiFileUpload from "@/components/customInput/multiFileUpload";

import data, { dpdGridButtons } from "./uploadDpdData";
import { formatFormData, getUserByCookies } from "@/utils";
import { insertUpdateForm } from "@/apis";

//import { extractTextFromPdfs } from "@/helper/pdfTextExtractor";

/** ---------------- helpers (PDF parser) ---------------- */
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

const looksLikePan = (token) => /^[A-Z]{5}\d{4}[A-Z]$/i.test(token || "");
const looksLikeDpd = (token) => /^[A-Z]\d{3}$/i.test(token || "");

function coerceExtractedToText(x) {
    if (typeof x === "string") return x;
    if (!x || typeof x !== "object") return String(x ?? "");
    return x.text || x.rawText || x.fullText || x.pdfText || x.content || "";
}

/**
 * ✅ Robust parser for JNPA "List of DPD parties..." PDF
 * Handles wrapped rows by parsing on full text (not by lines)
 */
function parseDpdTextToRows(fullText) {
    let t = String(fullText ?? "");
    if (!t.trim()) return [];

    // normalize whitespace but keep it as a single stream
    t = t.replace(/\r/g, "\n");
    t = t.replace(/[ \t]+/g, " ");

    // start after header if present (avoids From/To dates being picked)
    const low = t.toLowerCase();
    const idx = low.indexOf("sr.no");
    if (idx !== -1) t = t.slice(idx);

    // collapse ALL whitespace for regex scanning across line breaks
    const collapsed = clean(t);

    // row pattern:
    // <srno> <name...> <DPD> <PAN> <IEC>
    // stop when next srno starts
    const rowRegex =
        /(\d{1,5})\s+(.+?)\s+([A-Z]\d{3})\s+([A-Z]{5}\d{4}[A-Z])\s+([A-Z0-9]{6,20})(?=\s+\d{1,5}\s+|$)/gi;

    const rows = [];
    let m;

    while ((m = rowRegex.exec(collapsed)) !== null) {
        const srNo = Number(m[1]);
        const partyName = clean(m[2]);
        const dpd = clean(m[3]).toUpperCase();
        const pan = clean(m[4]).toUpperCase();
        const iec = clean(m[5]);

        // safety checks
        if (!srNo || !partyName) continue;
        if (!looksLikeDpd(dpd)) continue;
        if (!looksLikePan(pan)) continue;

        rows.push({
            // ❗ If your TableGrid already shows Sr.No automatically, DO NOT store srNo in row
            // srNo,
            partyName,
            dpdCode: dpd,
            panNo: pan,
            iecCode: iec,
            status: 1,
        });
    }

    // de-dupe (PAN + DPD + Name)
    const seen = new Set();
    const unique = [];
    for (const r of rows) {
        const key = `${r.panNo}|${r.dpdCode}|${r.partyName}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(r);
    }

    return unique;
}
export default function DpdPartyUploadPage() {
    const userData = getUserByCookies();

    const [formData, setFormData] = useState({
        shippingLineId: null,
        tblDpdParty: [],
    });
    const [fieldsMode] = useState("add");

    const rows = useMemo(() => formData?.tblDpdParty || [], [formData]);

    // Put this in a "use client" file (important)
    // "use client";

    // Keep your <MultiFileUpload onChange={handleFilesChange} /> as-is.
    // This function will (1) read PDF text in the browser, (2) parse rows using regex, (3) console.log JSON.

    const handleFilesChange = async (fileList) => {
        try {
            const files = Array.from(fileList || []).filter(Boolean);
            if (!files.length) {
                console.log("No files selected");
                return;
            }

            // ✅ load pdfjs ONLY on client inside this function (avoids Next build/canvas issues)
            let pdfjsMod;
            try {
                pdfjsMod = await import("pdfjs-dist/legacy/build/pdf");
            } catch (e1) {
                pdfjsMod = await import("pdfjs-dist/legacy/build/pdf.js");
            }

            // pdfjs module can be either {getDocument,...} or {default:{getDocument,...}}
            const pdfjsLib = pdfjsMod?.getDocument ? pdfjsMod : pdfjsMod?.default;
            if (!pdfjsLib?.getDocument) {
                console.error("pdfjs not loaded properly:", pdfjsMod);
                return;
            }

            // ✅ Worker (safe). CDN worker so no bundling issues.
            if (pdfjsLib.GlobalWorkerOptions) {
                const already = pdfjsLib.GlobalWorkerOptions.workerSrc;
                if (!already) {
                    const ver = pdfjsLib.version || "3.11.174";
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.js`;
                }
            }

            // -----------------------------------------
            // 1) Extract text as REAL lines (by Y axis)
            // -----------------------------------------
            const normalizeLine = (s) => String(s || "").replace(/\s+/g, " ").trim();

            const buildLinesFromTextContent = (textContent) => {
                const items = (textContent?.items || []).filter(
                    (it) => it && typeof it.str === "string"
                );

                // Group by Y (line). Y varies slightly -> round it.
                const lineMap = new Map(); // yKey -> [{x,str}]
                for (const it of items) {
                    const str = normalizeLine(it.str);
                    if (!str) continue;

                    const tr = it.transform || [];
                    const x = Number(tr[4] ?? 0);
                    const y = Number(tr[5] ?? 0);

                    // 0.5 precision works well for tables
                    const yKey = Math.round(y * 2) / 2;

                    if (!lineMap.has(yKey)) lineMap.set(yKey, []);
                    lineMap.get(yKey).push({ x, str });
                }

                // Sort lines top->bottom (higher y first)
                const ys = Array.from(lineMap.keys()).sort((a, b) => b - a);

                const lines = [];
                for (const y of ys) {
                    const parts = lineMap.get(y) || [];
                    parts.sort((a, b) => a.x - b.x); // left->right

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

                console.log("PDF:", file.name, "pages:", pdf.numPages);

                const allLines = [];
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);

                    // Note: disableCombineTextItems is older; keep simple call
                    const textContent = await page.getTextContent();

                    const pageLines = buildLinesFromTextContent(textContent);

                    // Blank line between pages to prevent accidental merges
                    allLines.push(...pageLines, "");
                }

                extractedDocs.push({
                    fileName: file.name,
                    lines: allLines,
                    text: allLines.join("\n"),
                    pageCount: pdf.numPages,
                });
            }

            const rawText = extractedDocs.map((d) => d.text || "").join("\n");

            const text = String(rawText || "")
                .replace(/\r/g, "\n")
                .replace(/[ \t]+/g, " ")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

            console.log("PDF TEXT (first 1200 chars):", text.slice(0, 1200));
            console.log("PDF TEXT (last 1200 chars):", text.slice(-1200));

            // -----------------------------------------
            // 2) Parse rows (SrNo Name DPD PAN IEC)
            // -----------------------------------------
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

            const rows = [];
            let cur = null;

            const eatTailTokens = (tokens, state) => {
                // Remove dpd/pan/iec from the tail (name can contain spaces)
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
                    rows.push({
                        srNo: cur.srNo,
                        name,
                        dpdCode: String(cur.dpdCode || "").toUpperCase(),
                        panNumber: String(cur.panNumber || "").toUpperCase(),
                        iecCode: String(cur.iecCode || ""),
                    });
                }
                cur = null;
            };

            for (const line of cleanedLines) {
                // new row: starts with sr no
                const m = line.match(/^(\d{1,6})\s+(.*)$/);
                if (m) {
                    flush();

                    cur = {
                        srNo: Number(m[1]),
                        nameParts: [],
                        dpdCode: "",
                        panNumber: "",
                        iecCode: "",
                    };

                    const rest = m[2];
                    const tokens = rest.split(" ").filter(Boolean);

                    eatTailTokens(tokens, cur);

                    const nm = normalizeLine(tokens.join(" "));
                    if (nm) cur.nameParts.push(nm);
                    continue;
                }

                // continuation line
                if (!cur) continue;

                const tokens = line.split(" ").filter(Boolean);
                eatTailTokens(tokens, cur);

                const leftover = normalizeLine(tokens.join(" "));
                if (leftover) cur.nameParts.push(leftover);
            }
            flush();

            // -----------------------------------------
            // 3) Output: FULL JSON array in console
            // -----------------------------------------
            const fullJsonData = rows; // ✅ as requested
            console.log("fullJsonData:", fullJsonData);
            console.log("DPD JSON total rows:", fullJsonData.length);
            console.log("DPD JSON first 10:", fullJsonData.slice(0, 10));
            console.log("DPD JSON last 10:", fullJsonData.slice(-10));

            if (fullJsonData.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    tblDpdParty: fullJsonData.map((r) => ({
                        partyName: r.name || "",
                        dpdCode: r.dpdCode || "",
                        panNo: r.panNumber || "",
                        iecCode: r.iecCode || "",
                    })),
                }));
            }
            // Stats (helps verify extraction is reading all pages)
            const perFileStats = extractedDocs.map((d) => ({
                file: d.fileName,
                pageCount: d.pageCount,
                lineCount: d.lines.length,
                textLen: (d.text || "").length,
            }));
            console.log("PDF extraction stats:", perFileStats);

            if (!fullJsonData.length) {
                console.warn(
                    "PDF text was read, but no rows matched. Check the 'PDF TEXT' output above."
                );
            }
        } catch (err) {
            console.error("handleFilesChange error:", err);
        }
    };



    const submitHandler = async (e) => {
        e.preventDefault();

        const shippingLineId =
            formData?.shippingLineId?.Id ?? formData?.shippingLineId?.id ?? null;

        if (!shippingLineId) {
            toast.error("Please select Shipping Line first.");
            return;
        }

        if (!rows.length) {
            toast.error("Please upload PDF and load rows first.");
            return;
        }

        try {
            let allSuccess = true;

            const promises = rows.map(async (r, idx) => {
                const payload = formatFormData(
                    "tblDpdParty",
                    {
                        ...r,
                        companyId: userData?.companyId,
                        companyBranchId: userData?.branchId,
                        shippingLineId,
                    },
                    r?.id ?? null
                );

                const { success, message, error } = await insertUpdateForm(payload);
                if (!success) {
                    allSuccess = false;
                    toast.error(error || message || `Row ${idx + 1} failed`);
                }
            });

            await Promise.allSettled(promises);

            if (allSuccess) toast.success("DPD parties uploaded successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Upload failed.");
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={submitHandler}>
                <section className="py-2 px-4">
                    <Box className="flex justify-between items-end mb-2">
                        <h1 className="text-left text-base m-0">Upload DPD Parties</h1>
                        <Box className="flex gap-2">
                            <CustomButton text="Back" href="/masters/dpdParties/list" />
                        </Box>
                    </Box>

                    <FormHeading text="Upload Filters" variant="body2" />
                    <Box className="grid grid-cols-3 gap-2 p-2">
                        <CustomInput
                            fields={data.uploadFields}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                        />
                    </Box>

                    <FormHeading text="Upload File" variant="body2" />
                    <Box className="border border-gray-300 p-3 mt-2 flex flex-col gap-2">
                        <Box sx={{ p: 1 }}>
                            <MultiFileUpload
                                label="Upload DPD Parties PDF"
                                helperText="Upload PDF file provided by Customs / Shipping Line"
                                accept=".pdf,application/pdf"
                                onChange={handleFilesChange}
                            />
                        </Box>
                    </Box>

                    <FormHeading text="DPD Party Preview" variant="body2" />
                    <Box className="border border-gray-300 p-2 mt-2">
                        <TableGrid
                            fields={data.tblDpdParty}
                            formData={formData}
                            setFormData={setFormData}
                            fieldsMode={fieldsMode}
                            gridName="tblDpdParty"
                            buttons={dpdGridButtons}
                        />
                    </Box>

                    <Box className="w-full flex justify-center gap-2 mt-4">
                        <CustomButton text="Save Upload" type="submit" />
                    </Box>
                </section>
            </form>

            <ToastContainer />
        </ThemeProvider>
    );
}
