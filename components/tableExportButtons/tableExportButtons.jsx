"use client";
import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import CustomButton from "../button/button";

const csvEscape = (s) => {
  const v = String(s ?? "");
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

export default function TableExportButtons({
  targetRef,
  title = "Report",
  fileName = "report",
}) {
  const getTable = () => targetRef?.current?.querySelector("table");

  const exportCSV = () => {
    const table = getTable();
    if (!table) return alert("Table not found.");
    const rows = Array.from(table.querySelectorAll("tr"));
    const csv = rows
      .map((tr) =>
        Array.from(tr.querySelectorAll("th,td"))
          .map((cell) => csvEscape(cell.innerText))
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const table = getTable();
    if (!table) return alert("Table not found.");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    autoTable(doc, {
      html: table,
      startY: 60,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: {
        fillColor: [149, 169, 232],
        textColor: 255,
        fontStyle: "bold",
      },
      didDrawPage: (data) => {
        const p = `Page ${doc.getNumberOfPages()}`;
        doc.setFontSize(9);
        doc.text(
          p,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 20
        );
      },
    });
    doc.save(`${fileName}.pdf`);
  };

  const printTable = () => {
    const table = getTable();
    if (!table) return alert("Table not found.");
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 12mm; }
              thead th { background:#95a9e8; color:#fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; }
            h1 { font-size:16px; margin:0 0 10px; }
            table { width:100%; border-collapse:collapse; font-size:12px; }
            th, td { border:1px solid #000; padding:6px; text-align:left; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${table.outerHTML}
          <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();};</script>
        </body>
      </html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="flex border text-black border-[#B5C4F0] mt-2 text-xs rounded-sm">
      <div
        onClick={exportCSV}
        className="flex-1 text-center py-1 px-3 cursor-pointer border-r border-[#B5C4F0] hover:bg-[#B5C4F0] hover:text-white">
        CSV
      </div>
      <div
        onClick={exportPDF}
        className="flex-1 text-center py-1 px-3 cursor-pointer border-r border-[#B5C4F0] hover:bg-[#B5C4F0] hover:text-white">
        PDF
      </div>
      <div
        onClick={printTable}
        className="flex-1 text-center py-1 px-3 cursor-pointer hover:bg-[#B5C4F0] hover:text-white">
        Print
      </div>
    </div>
  );
}
