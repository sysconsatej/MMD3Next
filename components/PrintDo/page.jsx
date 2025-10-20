/* eslint-disable */
"use client";
import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

Print.propTypes = {
    apiBaseUrl: PropTypes.string.isRequired,
    printOrientation: PropTypes.oneOf(["portrait", "landscape"]),
    pdfFilename: PropTypes.string,
    enquiryModuleRefs: PropTypes.any,
    useRefsHtml: PropTypes.bool,
    cssPath: PropTypes.string,
};

export default function Print({
    apiBaseUrl,
    printOrientation = "portrait",
    pdfFilename = "Report",
    enquiryModuleRefs,
    useRefsHtml = false,
    cssPath = "/style/reportTheme.css",
}) {
    const [busy, setBusy] = useState(false);
    const clickGuard = useRef(false);

    const normalizeBase = (base) => (base?.endsWith("/") ? base : `${base || ""}/`);

    const getCssText = useCallback(async () => {
        try {
            const res = await fetch(cssPath, { cache: "no-store" });
            if (!res.ok) return "";
            return await res.text();
        } catch {
            return "";
        }
    }, [cssPath]);

    const buildHtmlFromRefs = useCallback(async () => {
        const css = await getCssText();
        const elements = enquiryModuleRefs?.current || [];
        const bodyHtml = elements
            .filter(Boolean)
            .map((el, idx) => (idx > 0 ? `<div style="page-break-before: always;"></div>${el.innerHTML}` : el.innerHTML))
            .join("");
        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>html,body{background:#fff;color:#000}${css}</style>
        </head>
        <body>${bodyHtml}</body>
      </html>
    `;
    }, [enquiryModuleRefs, getCssText]);

    const getOuterHtml = useCallback(() => {
        const root = document.querySelector("#report-root");
        if (!root) return null;
        return root.outerHTML;
    }, []);

    const triggerDownload = (blob, filename) => {
        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObj;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(urlObj);
    };

    const handleDownloadPdf = useCallback(async () => {
        if (clickGuard.current || busy) return;
        if (!apiBaseUrl) {
            toast.error("Missing API base URL.");
            return;
        }
        clickGuard.current = true;
        setBusy(true);

        try {
            await new Promise((r) => setTimeout(r, 0));

            let htmlContent = null;

            if (useRefsHtml) {
                if (!enquiryModuleRefs?.current?.length) {
                    toast.error("No printable sections found via refs.");
                    return;
                }
                htmlContent = await buildHtmlFromRefs();
            } else {
                htmlContent = getOuterHtml();
                if (!htmlContent) {
                    toast.error("Printable element (#report-root) not found.");
                    return;
                }
            }

            const base = normalizeBase(apiBaseUrl);
            const safeName = String(pdfFilename || "Report").replace(/[\\/:*?"<>|]+/g, "_") || "Report";
            const payload = {
                htmlContent,
                orientation: printOrientation,
                pdfFilename: safeName,
            };

            const res = await fetch(`${base}api/v1/localPDFReports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let serverMsg = "";
                try {
                    serverMsg = (await res.json())?.message || "";
                } catch {
                    try {
                        serverMsg = await res.text();
                    } catch { }
                }
                throw new Error(serverMsg || `PDF failed (HTTP ${res.status})`);
            }

            const blob = await res.blob();
            triggerDownload(blob, `${safeName}.pdf`);
        } catch (err) {
            console.error("PDF generation error:", err);
            toast.error(err?.message || "Failed to generate PDF");
        } finally {
            setBusy(false);
            setTimeout(() => (clickGuard.current = false), 300);
        }
    }, [apiBaseUrl, buildHtmlFromRefs, busy, enquiryModuleRefs, getOuterHtml, pdfFilename, printOrientation, useRefsHtml]);

    return (
        <div className="flex space-x-4 p-2 mb-5 no-print">
            <button
                type="button"
                disabled={busy}
                className={`ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white rounded-lg focus:ring-4 ${busy ? "bg-gray-500" : "bg-blue-700 hover:bg-blue-800"}`}
                onClick={handleDownloadPdf}
                title={busy ? "Preparing PDF…" : "Download"}
            >
                {busy ? "Preparing…" : "Download"}
            </button>
        </div>
    );
}
