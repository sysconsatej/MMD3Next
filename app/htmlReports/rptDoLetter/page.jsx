"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Print from "@/components/PrintDo/page";
import "./rptDoLetter.css";

const decryptSafe = (v) => {
    try {
        return typeof decrypt === "function" ? decrypt(v) : v;
    } catch {
        return v;
    }
};
const getUserDetailsSafe = () => {
    try {
        return typeof getUserDetails === "function" ? getUserDetails() : { clientId: null };
    } catch {
        return { clientId: null };
    }
};

function RptDoLetter() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const assetBaseUrl = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

    const searchParams = useSearchParams();
    const [reportIds, setReportIds] = useState([]);
    const [data, setData] = useState([]);
    const enquiryModuleRefs = useRef([]);
    enquiryModuleRefs.current = [];

    const { clientId } = getUserDetailsSafe();
    const chunkSize = 6; // containers per page

    // read selected reports (only "Survey Letter" for now, but extensible)
    useEffect(() => {
        const stored = sessionStorage.getItem("selectedReportIds");
        if (stored) {
            const arr = JSON.parse(stored);
            setReportIds(Array.isArray(arr) ? arr : [arr]);
        } else {
            const q = searchParams.get("reportId") || searchParams.get("reportName");
            if (q) setReportIds([q]);
        }
    }, [searchParams]);

    // fetch DO data for the recordId (used by Survey Letter)
    useEffect(() => {
        const fetchData = async () => {
            const idStr = searchParams.get("recordId");
            const cidStr = searchParams.get("clientId");
            const id = Number(idStr);
            const clientIdParam = Number(cidStr);

            if (!Number.isFinite(id) || !Number.isFinite(clientIdParam)) return;

            try {
                const response = await fetch(`${baseUrl}api/v1/blDataForDO`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, clientId: clientIdParam }),
                });

                if (!response.ok) {
                    const errText = await response.text().catch(() => null);
                    throw new Error(errText || "Failed to fetch DO data");
                }

                const json = await response.json();
                setData(json?.data ?? []);
            } catch (e) {
                console.error("Error fetching job data:", e);
            }
        };

        if (reportIds.length > 0) fetchData();
    }, [reportIds, searchParams, baseUrl]);

    // utils
    const formatDateToYMD = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    // header/footer logos
    const CompanyImgModule = () => {
        const storedUserData = localStorage.getItem("userData");
        let imageHeader = null;
        if (storedUserData) {
            const decrypted = decryptSafe(storedUserData);
            const userData = JSON.parse(decrypted);
            imageHeader = userData?.[0]?.headerLogoPath ?? null;
        }
        const src = imageHeader && assetBaseUrl ? assetBaseUrl + imageHeader : "";
        return <img src={src} style={{ width: "100%" }} alt="LOGO" />;
    };

    const CompanyImgFooterModule = () => {
        const storedUserData = localStorage.getItem("userData");
        let imageFooter = null;
        if (storedUserData) {
            const decrypted = decryptSafe(storedUserData);
            const userData = JSON.parse(decrypted);
            imageFooter = userData?.[0]?.footerLogoPath ?? null;
        }
        const src = imageFooter && assetBaseUrl ? assetBaseUrl + imageFooter : "";
        return <img src={src} style={{ width: "100%" }} alt="Footer" />;
    };

    // paging containers
    const containers = data?.[0]?.tblBlContainer || [];
    const chunkArray = (arr, size) => {
        if (!Array.isArray(arr) || size <= 0) return [arr || []];
        const out = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    };
    const chunks = chunkSize > 0 ? chunkArray(containers, chunkSize) : [containers];

    const ImgSign = () => (
        <img
            src="https://expresswayshipping.com/sql-api/uploads/sign1.jpg"
            width="20%"
            height="15%"
            alt="Signature"
        />
    );

    // === Report: Survey Letter ===
    const SurveyLetter = (input) => {
        const list = Array.isArray(input) ? input : Array.isArray(input?.containers) ? input.containers : [];

        return (
            <div>
                <div className="mx-auto">
                    <CompanyImgModule />
                </div>

                <div className="mx-auto text-black">
                    <h1 className="text-black font-bold text-sm text-center underline">Survey Letter</h1>

                    <div style={{ width: "100%" }} className="flex justify-between">
                        <div style={{ width: "40%" }} className="flex items-end justify-start w-[40%]">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                                To, <br />
                                The Manager,<br />
                                {data?.[0]?.surveyor || ""}<br />
                                {data?.[0]?.surveyorAddress || ""}
                            </p>
                        </div>

                        <div className="flex items-start justify-end">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>Date :</p>
                            <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}>
                                {formatDateToYMD(data?.[0]?.doDate)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <table className="w-full table-fixed border border-black border-collapse mt-4">
                    <tbody>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>VESSEL/VOY :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.podVessel || ""} {data?.[0]?.podVoyage || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>ARRIVAL DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.arrivalDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>PLACE OF ORIGIN :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.plr || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>LOAD PORT :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.pol || ""}</p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>DISCH PORT :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.pod || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>FINAL DEST :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.fpd || ""}</p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>B/L NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.blNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>B/L DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.blDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>IGM NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.igmNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>IGM DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.igmDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>ITEM NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.lineNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>TERMINAL :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.berthName || ""}</p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>CONSIGNEE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data?.[0]?.consigneeText || ""}</span><br />
                                    <span style={{ wordBreak: "break-word" }}>{data?.[0]?.consigneeAddress || ""}</span>
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>NOTIFY PARTY :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data?.[0]?.notifyPartyText || ""}</span><br />
                                    <span style={{ wordBreak: "break-word" }}>{data?.[0]?.notifyPartyAddress || ""}</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p className="text-black mt-2" style={{ fontSize: "10px" }}>
                    Kindly arrange to survey the below container(s) prior to taking delivery of laden container(s)
                    from {data?.[0]?.surveyor || ""} to check for the external condition of the container(s).
                </p>

                <table className="w-full mt-4 table-fixed border border-black border-collapse">
                    <thead>
                        <tr>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Container No.</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Size/Type</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Status</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Gross Wt.</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>No. of Packages</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Seal No.</p></th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal" style={{ fontSize: "9px" }}>{item.containerNo || ""}</p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-left" style={{ fontSize: "9px" }}>
                                        {(item.size || "") + "/" + (item.type || "")}
                                    </p>
                                </th>
                                <th className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black" style={{ fontSize: "9px" }}>{item.containerStatus || ""}</p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-left" style={{ fontSize: "9px" }}>
                                        {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                                    </p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-left" style={{ fontSize: "9px" }}>
                                        {item.noOfPackages || ""} {item.packageCode || ""}
                                    </p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-right" style={{ fontSize: "9px" }}>
                                        {item.customSealNo || ""}
                                    </p>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div style={{ width: "15%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Description :</p>
                    </div>
                    <div style={{ width: "85%" }}>
                        <p className="text-black" style={{ fontSize: "10px" }}>{data?.[0]?.goodsDesc || ""}</p>
                    </div>
                </div>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div style={{ width: "15%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Marks & Nos :</p>
                    </div>
                    <div style={{ width: "85%" }}>
                        <p className="text-black" style={{ fontSize: "10px" }}>{data?.[0]?.marksNos || ""}</p>
                    </div>
                </div>

                <footer style={{ bottom: "10px", width: "100%" }}>
                    <div>
                        <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
                            Thanking You, <br /> For {data?.[0]?.company}
                        </p>

                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Authorize Signatory</p>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                            C.C TO M/s M/S {data?.[0]?.consignee}
                        </p>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>C.C. Deport</p>
                    </div>
                </footer>
            </div>
        );
    };

    // Optional: local “Download PDF” button using /localPDFReports (kept for convenience)
    const handleDownloadPdf = async () => {
        const root = document.querySelector("#report-root");
        if (!root) return alert("Printable element (#report-root) not found");

        try {
            const r = await fetch(`${baseUrl}api/v1/localPDFReports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    htmlContent: root.outerHTML,
                    orientation: "portrait",
                    pdfFilename: `Survey_Letter_${data?.[0]?.blNo || "report"}`,
                }),
            });

            if (!r.ok) {
                let msg = "PDF failed";
                try {
                    const errJson = await r.json();
                    msg = errJson?.message || msg;
                } catch { }
                throw new Error(msg);
            }

            const blob = await r.blob();
            const urlObj = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlObj;
            a.download = `Survey_Letter_${data?.[0]?.blNo || "report"}.pdf`;
            a.click();
            URL.revokeObjectURL(urlObj);
        } catch (e) {
            console.error(e);
            alert(e?.message || "Failed to generate PDF");
        }
    };

    return (
        <main>
            <div className="no-print mt-4 flex justify-end">
                <button className="px-3 py-2 border rounded" onClick={handleDownloadPdf}>
                    Download PDF
                </button>
            </div>

            {/* Everything that should be in the PDF goes inside #report-root */}
            <div id="report-root" className="mt-5">
                <Print
                    enquiryModuleRefs={enquiryModuleRefs}
                    printOrientation="portrait"
                    reportIds={reportIds}
                />

                {reportIds.map((reportId, index) => {
                    switch (reportId) {
                        case "Survey Letter": {
                            const pages = (Array.isArray(chunks) ? chunks.filter(Boolean) : []).length
                                ? chunks
                                : [undefined];

                            return (
                                <React.Fragment key={`survey-${index}`}>
                                    {pages.map((container, i) => (
                                        <React.Fragment key={`page-${i}`}>
                                            <div
                                                ref={(el) => enquiryModuleRefs.current.push(el)}
                                                className={`relative bg-white shadow-lg black-text ${i < pages.length - 1 ? "report-spacing" : ""}`}
                                                style={{
                                                    width: "210mm",
                                                    minHeight: "297mm",
                                                    margin: "auto",
                                                    padding: "24px",
                                                    boxSizing: "border-box",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    position: "relative",
                                                    pageBreakAfter: i < pages.length - 1 ? "always" : "auto",
                                                }}
                                            >
                                                <div className="flex-grow p-4" style={{ maxHeight: "275mm", minHeight: "275mm" }}>
                                                    {SurveyLetter(container)}
                                                </div>
                                                <div className="pl-4">
                                                    <CompanyImgFooterModule />
                                                </div>

                                                <style jsx>{`
                          .black-text { color: black !important; }
                          @media print { .report-spacing { page-break-after: always; } }
                        `}</style>
                                            </div>
                                            <div className="bg-gray-300 h-2 no-print" />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        }

                        // Add more cases here later, example:
                        // case "Another Report":
                        //   return <AnotherReport ... />

                        default:
                            return null;
                    }
                })}
            </div>
        </main>
    );
}

export default RptDoLetter;
