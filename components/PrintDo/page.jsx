/* eslint-disable */
"use client";
import React from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { printPDF } from "@/apis/dynamicReport";

Print.propTypes = {
    enquiryModuleRefs: PropTypes.any,
    printOrientation: PropTypes.any,
    reportIds: PropTypes.any,
};

export default function Print({ enquiryModuleRefs, printOrientation, reportIds }) {
    const getCssText = async () => {
        try {
            const res = await fetch("/style/reportTheme.css", { cache: "no-store" });
            return await res.text();
        } catch {
            return "";
        }
    };

    const buildHtml = async (withPageBreaks = true) => {
        const css = await getCssText();
        const elements = enquiryModuleRefs.current || [];

        const bodyHtml = elements
            .filter(Boolean)
            .map((el, idx) =>
                withPageBreaks && idx > 0
                    ? `<div style="page-break-before: always;"></div>${el.innerHTML}`
                    : el.innerHTML
            )
            .join("");

        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${css}</style>
        </head>
        <body>${bodyHtml}</body>
      </html>
    `;
    };

    const pdfBaseName = (reportIds?.join("-") || "Report").replace(/[\\/:*?"<>|]+/g, "_");
    const pdfFileName = `${pdfBaseName}.pdf`;

    const handlePrint = async () => {
        try {
            const htmlContent = await buildHtml(true); // keep page breaks
            const requestBody = { orientation: printOrientation, pdfFilename: pdfBaseName, htmlContent };
            const blob = await printPDF(requestBody); // must return a Blob from your API layer

            if (!(blob instanceof Blob)) throw new Error("PDF service did not return a Blob");

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", pdfFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error while generating PDF:", error);
            toast.error("PDF generation failed.");
        }
    };

    const handlePDFEmail = async () => {
        try {
            const htmlContent = await buildHtml(true);
            const requestBody = { orientation: printOrientation, pdfFilename: pdfBaseName, htmlContent };
            const res = await emailPDF(requestBody);

            if (res?.success) {
                toast.success("PDF emailed successfully.");
            } else {
                toast.error(res?.message || "Failed to email PDF.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error while emailing PDF.");
        }
    };

    const handleEmailBody = async () => {
        try {
            const css = await getCssText();
            const elements = enquiryModuleRefs.current || [];
            const bodyHtml = elements.filter(Boolean).map((el) => el.innerHTML).join("");

            const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>${css}</style>
          </head>
          <body class="text-[13px] text-gray-800 bg-white">${bodyHtml}</body>
        </html>
      `;

            const payload = {
                to: "client@example.com",
                cc: "",
                bcc: "",
                subject: `Report: ${pdfBaseName}`,
                body: "Please find the report below.",
                htmlContent: fullHtml,
            };

            const res = await emailReportsInBody(payload);
            if (res?.success) {
                toast.success("Email sent successfully.");
            } else {
                toast.error(res?.message || "Failed to send email.");
            }
        } catch (error) {
            console.error("Error while sending email:", error);
            toast.error("Error while sending email.");
        }
    };

    return (
        <div className="flex space-x-4 p-2 mb-5">
            {/* <button
                className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                onClick={handlePrint}
            >
                Download
            </button> */}
            {/* <button
                className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                onClick={handlePDFEmail}
            >
                PDF
            </button>
            <button
                className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                onClick={handleEmailBody}
            >
                Email
            </button> */}
        </div>
    );
}
