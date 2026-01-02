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

const normalizeId = (s) => (s || "").toString().trim().toLowerCase();

function RptDoLetter() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const assetBaseUrl = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

    const searchParams = useSearchParams();
    const [reportIds, setReportIds] = useState([]);
    const [mode, setMode] = useState("combined");
    const [data, setData] = useState([]);
    const enquiryModuleRefs = useRef([]);
    enquiryModuleRefs.current = [];
    const refSeq = useRef(0);

    const { clientId } = getUserDetailsSafe();
    const chunkSize = 6;

    useEffect(() => {
        const stored = sessionStorage.getItem("selectedReportIds");
        const storedMode = sessionStorage.getItem("reportMode");

        const qpMode = (searchParams.get("mode") || "").toLowerCase();
        const qpSelected = searchParams.get("selected");

        if (storedMode === "combined" || storedMode === "separate") {
            setMode(storedMode);
        } else if (qpMode === "combined" || qpMode === "separate") {
            setMode(qpMode);
        }

        if (qpSelected) {
            let arr = [];
            try {
                arr = JSON.parse(qpSelected);
                if (!Array.isArray(arr)) arr = [String(arr)];
            } catch {
                arr = qpSelected.split(/[!,]/).map(s => s.trim()).filter(Boolean);
            }
            setReportIds(arr);
        } else if (stored) {
            const arr = JSON.parse(stored);
            setReportIds(Array.isArray(arr) ? arr : [arr]);
        } else {
            const q = searchParams.get("reportId") || searchParams.get("reportName");
            if (q) setReportIds([q]);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            const idStr = searchParams.get("recordId");
            const cidStr = searchParams.get("clientId");
            const id = Number(idStr);
            const cidFromQuery = Number(cidStr);
            const cidFinal = Number.isFinite(cidFromQuery) ? cidFromQuery : Number(clientId);
            if (!Number.isFinite(id) || !Number.isFinite(cidFinal)) return;

            try {
                const response = await fetch(`${baseUrl}api/v1/blDataForDO`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, clientId: cidFinal }),
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
    }, [reportIds, searchParams, baseUrl, clientId]);

    const formatDateToYMD = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const CompanyImgModule = () => {
        const storedUserData = localStorage.getItem("userData");
        let imageHeader = null;
        if (storedUserData) {
            const decrypted = decryptSafe(storedUserData);
            const userData = JSON.parse(decrypted);
            imageHeader = userData?.[0]?.headerLogoPath ?? null;
        }
        const src = imageHeader && assetBaseUrl ? assetBaseUrl + imageHeader : "";
        return <img src={src} style={{ width: "100%", maxWidth: "100%", height: "auto" }} alt="LOGO" />;
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
        return <img src={src} style={{ width: "100%", maxWidth: "100%", height: "auto" }} alt="Footer" />;
    };

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
            // src="https://expresswayshipping.com/sql-api/uploads/sign1.jpg"
            width="20%"
            height="15%"
            alt="Signature"
            style={{ maxWidth: "100%", height: "auto" }}
        />
    );

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
                            <tr key={`survey-row-${index}`}>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal" style={{ fontSize: "9px" }}>{item.containerNo || ""}</p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.sizeType || "")}
                                    </p>
                                </th>
                                <th className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black" style={{ fontSize: "9px" }}>{item.containerStatus || ""}</p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.grossWt || "") + " " + (item.weightUnitCode || "")}
                                    </p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.noOfPackages || ""} {item.packageCode || ""}
                                    </p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal  text-center" style={{ fontSize: "9px" }}>
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

                <div className="footer">
                    <div>
                        <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
                            Thanking You, <br /> For {data?.[0]?.company}
                        </p>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Authorize Signatory</p>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                            C.C TO M/S {data?.[0]?.consigneeText}
                        </p>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>C.C. Deport</p>
                    </div>
                    <div style={{ marginTop: "6mm" }}>
                        <CompanyImgFooterModule />
                    </div>
                </div>
            </div>
        );
    };

    const DoLetter = (input, i) => {
        const containersLocal = Array.isArray(input)
            ? input
            : Array.isArray(input?.containers)
                ? input.containers
                : [];

        const totals = containersLocal.reduce(
            (acc, c) => {
                const gw = Number(c?.grossWt) || 0;
                const pk = Number(c?.noOfPackages) || 0;
                acc.totalGrossWt += gw;
                acc.totalPackages += pk;
                if (!acc.weightUnit && c?.weightUnitCode) acc.weightUnit = c.weightUnitCode;
                if (!acc.packageUnit && c?.packageCode) acc.packageUnit = c.packageCode;
                return acc;
            },
            { totalGrossWt: 0, totalPackages: 0, weightUnit: "", packageUnit: "" }
        );

        return (
            <div>
                <div className="mx-auto">
                    <CompanyImgModule />
                </div>

                <div className="mx-auto text-black">
                    <h1 className="text-black font-bold text-sm text-center underline">
                        {data[0]?.destuffName ? `Delivery Order / ${data[0].destuffName}` : "Delivery Order"}
                    </h1>

                    <div className="flex items-end justify-end">
                        <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>D/O No:</p>
                        <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}>{data[0]?.doNo || ""}</p>
                    </div>

                    <div className="flex justify-between w-full">
                        <div className="flex items-end justify-start w-[40%]">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                                To, <br />
                                The Manager,<br />
                                {data[0]?.nominatedArea || ""}<br />
                                {data[0]?.nominatedAreaAddress || ""}<br />
                            </p>
                        </div>
                        <div className="flex items-start justify-end">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>Date :</p>
                            <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}>
                                {formatDateToYMD(data[0]?.doDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <table className="w-full table-fixed border border-black border-collapse mt-4">
                    <tbody>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>VESSEL/VOY :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>PORT/ICD ARR DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data[0]?.arrivalDate)}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>PLACE OF ORIGIN :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.plr || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>LOAD PORT :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.pol || ""}</p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>DISCH PORT :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.pod || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>FINAL DEST :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.fpd || ""}</p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>B/L NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.blNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>B/L DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data[0]?.blDate)}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>IGM NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.igmNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>IGM DATE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data[0]?.igmDate)}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>ITEM NO. :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.lineNo || ""}</p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>DESTUFFING TYPE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>{data[0]?.destuff || ""}</p>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>CONSIGNEE :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data[0]?.consigneeText || ""}</span><br />
                                    <span style={{ wordBreak: "break-word" }}>{data[0]?.consigneeAddress || ""}</span>
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>NOTIFY PARTY :</p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data[0]?.notifyPartyText || ""}</span><br />
                                    <span style={{ wordBreak: "break-word" }}>{data[0]?.notifyPartyAddress || ""}</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p className="text-black mt-2" style={{ fontSize: "10px" }}>
                    As per Consignees request please deliver to CHA {data[0]?.customBrokerName || ""}. The following packages. It is
                    required to take a proper receipt for the same.
                </p>

                <table className="w-full mt-2 table-fixed border border-black border-collapse">
                    <thead>
                        <tr>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Container No.</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Size/Type</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Status</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Gross Wt.</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>No. of Packages</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Seal No.</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>CBM</p></th>
                            <th className="w-1/8 border border-black p-1"><p className="text-black font-bold" style={{ fontSize: "9px" }}>Valid Date</p></th>
                        </tr>
                    </thead>
                    <tbody>
                        {containersLocal.map((item, index) => (
                            <tr key={`do-row-${index}`}>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>{item.containerNo || ""}</p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.sizeType || "")}
                                    </p>
                                </td>
                                <td className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black text-center" style={{ fontSize: "9px" }}>{item.containerStatus || ""}</p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.grossWt || "") + " " + (item.weightUnitCode || "")}
                                    </p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.noOfPackages || ""} {item.packageCode || ""}
                                    </p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.customSealNo || ""}
                                    </p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.volume || ""} {item.volumeUnitCode || ""}
                                    </p>
                                </td>
                                <td className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {formatDateToYMD(data?.[0]?.doValidDate)}
                                    </p>
                                </td>
                            </tr>
                        ))}

                        <tr>
                            <td colSpan={3} className="border border-black p-1 font-bold text-right" style={{ fontSize: "9px" }}>
                                TOTAL
                            </td>
                            <td className="border border-black p-1 font-bold text-center" style={{ fontSize: "9px" }}>
                                {totals.totalGrossWt.toFixed(2)} {totals.weightUnit}
                            </td>
                            <td className="border border-black p-1 font-bold text-center" style={{ fontSize: "9px" }}>
                                {totals.totalPackages} {totals.packageUnit}
                            </td>
                            <td colSpan={3} className="border border-black p-1"></td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div style={{ width: "15%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>No of Free Days :</p>
                    </div>
                    <div style={{ width: "85%" }}>
                        <p className="text-black" style={{ fontSize: "10px" }}>{data[0]?.destinationFreeDays || ""}</p>
                    </div>
                </div>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div style={{ width: "15%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Free Days Upto :</p>
                    </div>
                    <div style={{ width: "85%" }}>
                        <p className="text-black" style={{ fontSize: "10px" }}>{formatDateToYMD(data[0]?.freeDaysUpto)}</p>
                    </div>
                </div>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div style={{ width: "15%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>Description :</p>
                    </div>
                    <div style={{ width: "85%" }}>
                        <p className="text-black" style={{ fontSize: "10px" }}>{data[0]?.goodsDesc || ""}</p>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-black font-bold" style={{ fontSize: "10px" }}>Dear Sir</p>
                    <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                        Please deliver the above mentioned container/s to the above mentioned consignee / notify.
                    </p>
                    <div className="flex mt-1" style={{ width: "100%" }}>
                        <div style={{ width: "12%" }}>
                            <p className="text-black font-bold" style={{ fontSize: "10px" }}>Marks & No. :</p>
                        </div>
                        <div style={{ width: "88%" }}>
                            <p className="text-black" style={{ fontSize: "10px" }}>{data[0]?.marksNos || ""}</p>
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <div>
                        <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
                            Thanking You, For {data[0]?.company} <br /> As Agent
                        </p>
                        <p style={{ width: "80%", height: "100%" }}>
                            <ImgSign />
                        </p>
                    </div>
                    <div style={{ marginTop: "6mm" }}>
                        <CompanyImgFooterModule />
                    </div>
                </div>
            </div>
        );
    };

    const EmptyOffLoadingLetter = (containersProp) => (
        <div>
            <div className="mx-auto">
                <CompanyImgModule />
            </div>
            <div className="mx-auto text-black">
                <h1 className="text-black font-bold text-sm text-center underline">
                    <u>EMPTY OFF LOADING LETTER</u>
                </h1>
                <div className="flex items-end justify-end">
                    <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}></p>
                </div>
                <div className="flex justify-between w-full">
                    <div className="flex items-end justify-start w-[40%]">
                        <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                            To, <br />
                            The Manager, <br />
                            {data?.[0]?.emptyDepot || ""}
                            <br />
                            {data?.[0]?.emptyDepotAddress || ""}
                        </p>
                    </div>
                    <div className="flex items-start justify-end">
                        <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                            Date :
                        </p>
                        <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}>
                            {formatDateToYMD(data?.[0]?.doDate)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex mt-2" style={{ width: "100%" }}>
                <div style={{ width: "12%" }}>
                    <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                        Dear Sir,
                    </p>
                </div>
            </div>
            <div className="flex mt-1" style={{ width: "100%" }}>
                <div>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        Please Accept the below mentioned Empty container(s).On account of
                        <span className="text-black uppercase">{" " + data[0]?.mlo || ""}</span>
                    </p>
                </div>
            </div>

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
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>PORT/ICD ARR DATE :</p>
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
                        <td className="w-1/6 border-t border-b border-l border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>ITEM NO. :</p>
                        </td>
                        <td className="w-2/6 border-t border-b border-r border-black p-1">
                            <p className="text-black" style={{ fontSize: "9px" }}>{data?.[0]?.lineNo || ""}</p>
                        </td>
                        <td className="w-1/6 border-t border-b border-l border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>DESTUFFING TYPE :</p>
                        </td>
                        <td className="w-2/6 border-t border-b border-r border-black p-1">
                            <p className="text-black" style={{ fontSize: "9px" }}>
                                {data[0]?.destuff || ""}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>CONSIGNEE :</p>
                        </td>
                        <td className="w-2/6 border-t border-b border-r border-black p-1">
                            <p className="text-black" style={{ fontSize: "9px" }}>
                                <span>{data?.[0]?.consigneeText || ""}</span>
                                <br />
                                <span style={{ wordBreak: "break-word" }}>
                                    {data?.[0]?.consigneeAddress || ""}
                                </span>
                            </p>
                        </td>
                        <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>NOTIFY PARTY :</p>
                        </td>
                        <td className="w-2/6 border-t border-b border-r border-black p-1">
                            <p className="text-black" style={{ fontSize: "9px" }}>
                                <span>{data?.[0]?.notifyPartyText || ""}</span>
                                <br />
                                <span style={{ wordBreak: "break-word" }}>
                                    {data?.[0]?.notifyPartyAddress || ""}
                                </span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* main Grid */}
            <div className="flex mt-1" style={{ width: "100%" }}>
                <div style={{ width: "12%" }}>
                    <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                        CHA Name :
                    </p>
                </div>
                <div style={{ width: "88%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        {data[0]?.customBrokerName || ""}
                    </p>
                </div>
            </div>
            <div className="flex mt-1" style={{ width: "100%" }}>
                <div style={{ width: "12%" }}>
                    <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                        PRINCIPAL :
                    </p>
                </div>
                <div style={{ width: "88%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        {data[0]?.mlo || ""}
                    </p>
                </div>
            </div>
            {/* Container Details Grid */}
            <table className="w-full mt-2 table-fixed border border-black border-collapse">
                <thead>
                    <tr>
                        <th className="w-1/8 border border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                Container No.
                            </p>
                        </th>
                        <th className="w-1/8 border border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                Size/Type
                            </p>
                        </th>
                        <th className="w-1/8 border border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                Status
                            </p>
                        </th>
                        <th className="w-1/8 border border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                Off Hire Reference
                            </p>
                        </th>
                        <th className="w-1/8 border border-black p-1">
                            <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                Valid Date
                            </p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {containers?.length > 0 &&
                        containers?.map((item, index) => (
                            <tr key={index}>
                                <th className="w-1/8 border border-black p-1">
                                    <p
                                        className="text-black font-normal"
                                        style={{ fontSize: "9px" }}
                                    >
                                        {item.containerNo || ""}
                                    </p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p
                                        className="text-black font-normal text-center"
                                        style={{ fontSize: "9px" }}
                                    >
                                        {(item.sizeType || "")}
                                    </p>
                                </th>
                                <th className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black" style={{ fontSize: "9px" }}>
                                        {item.containerStatus || ""}
                                    </p>
                                </th>
                                <th className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black" style={{ fontSize: "9px" }}></p>
                                </th>
                                <th className="w-1/8 border border-black p-1">
                                    <p
                                        className="text-black font-normal"
                                        style={{ fontSize: "9px" }}
                                    >
                                        {formatDateToYMD(data?.[0]?.doValidDate)}
                                    </p>
                                </th>
                            </tr>
                        ))}
                </tbody>
            </table>

            <div className="flex mt-2" style={{ width: "100%" }}>
                <div style={{ width: "10%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        Note :
                    </p>
                </div>
                <div style={{ width: "98%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        Please do not offload the Container(s) if it comes after the
                        Validity date mentioned against each Container and inform us of its
                        arrival
                    </p>
                </div>
            </div>

            <div className="flex mt-2" style={{ width: "100%" }}>
                <div style={{ width: "15%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        Description :
                    </p>
                </div>
                <div style={{ width: "85%" }}>
                    <p className="text-black" style={{ fontSize: "10px" }}>
                        {data?.[0]?.description || ""}
                    </p>
                </div>
            </div>

            <div className="footer">
                <div>
                    <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
                        Thanking You, <br />
                        For {data?.[0]?.company} <br />
                    </p>
                    {/* <p style={{ width: "80%", height: "100%" }}>
                        <ImgSign />
                    </p> */}
                    {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
                    {/* <p className="text-black" style={{ fontSize: "10px" }}>
                        Please note this is a computer-generated document, hence no
                        signature and stamp required.
                    </p> */}
                </div>
            </footer>
        </div>
    );
    const CMCLetter = (container) => {
        const containersLocal = Array.isArray(container)
            ? container
            : Array.isArray(container?.containers)
                ? container.containers
                : [];

        return (
            <div>
                <div className="mx-auto">
                    <CompanyImgModule />
                </div>

                {/* Header */}
                <div className="mx-auto text-black">
                    <h1 className="text-black font-bold text-sm text-center underline">
                        <u>CMC Letter</u>
                    </h1>
                </div>

                {/* Main Grid */}
                <table className="w-full table-fixed border border-black border-collapse mt-4">
                    <tbody>
                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    VESSEL/VOY :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.podVessel || ""} {data?.[0]?.podVoyage || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    ARRIVAL DATE :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.arrivalDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    PLACE OF ORIGIN :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.plr || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    LOAD PORT :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.pol || ""}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    DISCH PORT :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.pod || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    FINAL DEST :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.fpd || ""}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    B/L NO. :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.blNo || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    B/L DATE :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.blDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    IGM NO. :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.igmNo || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    IGM DATE :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {formatDateToYMD(data?.[0]?.igmDate)}
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    ITEM NO. :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    {data?.[0]?.lineNo || ""}
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1" />
                            <td className="w-2/6 border-t border-b border-r border-black p-1" />
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    CONSIGNEE :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data?.[0]?.consigneeText || ""}</span>
                                    <br />
                                    <span style={{ wordBreak: "break-word" }}>
                                        {data?.[0]?.consigneeAddress || ""}
                                    </span>
                                </p>
                            </td>
                            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    NOTIFY PARTY :
                                </p>
                            </td>
                            <td className="w-2/6 border-t border-b border-r border-black p-1">
                                <p className="text-black" style={{ fontSize: "9px" }}>
                                    <span>{data?.[0]?.notifyPartyText || ""}</span>
                                    <br />
                                    <span style={{ wordBreak: "break-word" }}>
                                        {data?.[0]?.notifyPartyAddress || ""}
                                    </span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* To + Date */}
                <div className="mx-auto text-black mt-2">
                    <div className="flex justify-between w-full">
                        <div className="flex items-end justify-start">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                                To, <br />
                                The Assistant Commisioner of Custom, <br />
                                Container Cell <br />
                                {data?.[0]?.podCode || ""} <br />
                            </p>
                        </div>
                        <div className="flex items-start justify-end">
                            <p className="text-black font-bold mr-2" style={{ fontSize: "10px" }}>
                                Date :
                            </p>
                            <p className="text-black" style={{ fontSize: "10px", minWidth: "100px" }}>
                                {formatDateToYMD(data?.[0]?.doDate)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <p className="text-black mt-5" style={{ fontSize: "10px" }}>
                    Respected Sir,
                </p>

                <p className="text-black mt-5" style={{ fontSize: "10px" }}>
                    The below mentioned consignee desires to take the import loaded container to their factory
                    premises situated at factory for <br /> destuffing the import consignment
                </p>

                <p className="text-black mt-5 font-bold" style={{ fontSize: "10px" }}>
                    NAME OF THE CONSIGNEE : {data?.[0]?.consigneeText || ""}
                </p>

                <p className="text-black mt-1 font-bold" style={{ fontSize: "10px" }}>
                    CHA :{" " + data[0]?.customBrokerName || ""}

                </p>

                {/* Container table */}
                <table className="w-full mt-2 table-fixed border border-black border-collapse">
                    <thead>
                        <tr>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Container No.
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Size/Type
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Status
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Gross Wt.
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    No. of Packages
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Seal No.
                                </p>
                            </th>
                            <th className="w-1/8 border border-black p-1">
                                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                                    Valid Date
                                </p>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {containersLocal.map((item, index) => (
                            <tr key={`cmc-row-${index}`}>
                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                                        {item.containerNo || ""}
                                    </p>
                                </th>

                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.sizeType || "")}
                                    </p>
                                </th>

                                <th className="w-1/8 border font-normal border-black p-1">
                                    <p className="text-black" style={{ fontSize: "9px" }}>
                                        {item.containerStatus || ""}
                                    </p>
                                </th>

                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {(item.grossWt || "") + " " + (item.weightUnitCode || "")}
                                    </p>
                                </th>

                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.noOfPackages || ""} {item.packageCode || ""}
                                    </p>
                                </th>

                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {item.customSealNo || ""}
                                    </p>
                                </th>

                                <th className="w-1/8 border border-black p-1">
                                    <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                                        {formatDateToYMD(data?.[0]?.doValidDate)}
                                    </p>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex mt-2" style={{ width: "100%" }}>
                    <div>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                            We Kindly request to enter the above mentioned containers in our Bond Register No.
                            S\43-CONT(B) NS/147/2013 After destuffing, please allow to store the above mentioned
                            containers at our empty container yard.
                        </p>
                    </div>
                </div>

                <div className="flex mt-5 font-bold" style={{ width: "100%" }}>
                    <div style={{ width: "12%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                            Thanking You,
                        </p>
                    </div>
                </div>

                <div className="flex mt-1" style={{ width: "100%" }}>
                    <div style={{ width: "100%" }}>
                        <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                            For {data?.[0]?.company || ""}
                        </p>

                    </div>
                </div>

                <div style={{ marginTop: "20px" }}>

                </div>
            </div>
        );
    };
    const CustomsExaminationOrder = (input) => {
        const containersLocal = Array.isArray(input)
            ? input
            : Array.isArray(input?.containers)
                ? input.containers
                : [];

        return (
            <div>
                <div className="mx-auto">
                    <CompanyImgModule />
                </div>

                <div className="mx-auto text-black">
                    <h1 className="text-black font-bold text-sm text-center underline">
                        Customs Examination Order
                    </h1>
                </div>

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
                                <p className="text-black" style={{ fontSize: "9px" }}>{formatDateToYMD(data?.[0]?.blDate)}</p>
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
                                <p className="text-black" style={{ fontSize: "9px" }}>{formatDateToYMD(data?.[0]?.igmDate)}</p>
                            </td>
                        </tr>

                        <tr>
                            <td className="w-1/6 border-t border-b border-l border-black p-1">
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
                        {containersLocal.map((item, index) => (
                            <tr key={`ceo-row-${index}`}>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}>{item.containerNo || ""}</p></td>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}> {(item.sizeType || "")}</p></td>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}>{item.containerStatus || ""}</p></td>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}>{(item.grossWt || "") + " " + (item.weightUnitCode || "")}</p></td>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}>{item.noOfPackages || ""} {item.packageCode || ""}</p></td>
                                <td className="w-1/8 border border-black p-1"><p className="text-black text-center" style={{ fontSize: "9px" }}>{item.customSealNo || ""}</p></td>
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
            </div>
        );
    };
    const normalizedAll = reportIds.map(normalizeId);
    const pdfNameBase = `${(reportIds || []).join("_")}_${data?.[0]?.blNo || "report"}`;
    refSeq.current = 0;

    return (
        <main>
            <Print
                apiBaseUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
                printOrientation="portrait"
                pdfFilename={pdfNameBase}
                enquiryModuleRefs={enquiryModuleRefs}
                useRefsHtml
                cssPath="/style/reportTheme.css"
            />
            <div id="report-root" className="mt-5 exported">
                {normalizedAll.map((rid, index) => {
                    switch (rid) {
                        case "survey letter":
                        case "surveyletter":
                        case "survey_letter":
                        case "survey-letter": {
                            const pages = (Array.isArray(chunks) ? chunks.filter(Boolean) : []).length ? chunks : [undefined];
                            return (
                                <React.Fragment key={`survey-${index}`}>
                                    {pages.map((container, i) => (
                                        <React.Fragment key={`survey-${index}-page-${i}`}>
                                            <div
                                                className="a4-size"
                                                style={{ width: "210mm", height: "297mm", padding: "5mm", boxSizing: "border-box" }}
                                                ref={(el) => {
                                                    if (!el) return;
                                                    const k = refSeq.current++;
                                                    enquiryModuleRefs.current[k] = el;
                                                }}
                                            >
                                                <div className="main-border" style={{ height: "100%", width: "100%", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                                                    <div className="content" style={{ flex: "1 1 auto", overflow: "visible" }}>
                                                        {SurveyLetter(container)}
                                                    </div>
                                                    <div className="footer" style={{ marginTop: "auto" }} />
                                                </div>
                                            </div>
                                            <div className="bg-gray-300 h-2 no-print" />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        }

                        case "delivery order":
                        case "deliveryorder":
                        case "delivery_order":
                        case "delivery-order": {
                            const pages = Array.isArray(chunks) && chunks.length ? chunks : [undefined];
                            return (
                                <React.Fragment key={`do-${index}`}>
                                    {pages.map((container, i) => (
                                        <React.Fragment key={`do-${index}-page-${i}`}>
                                            <div
                                                className="a4-size"
                                                style={{ width: "210mm", height: "297mm", padding: "5mm", boxSizing: "border-box" }}
                                                ref={(el) => {
                                                    if (!el) return;
                                                    const k = refSeq.current++;
                                                    enquiryModuleRefs.current[k] = el;
                                                }}
                                                id="Delivery Order"
                                            >
                                                <div className="main-border" style={{ height: "100%", width: "100%", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                                                    <div className="content" style={{ flex: "1 1 auto", overflow: "visible" }}>
                                                        {DoLetter(container, i)}
                                                    </div>
                                                    <div className="footer" style={{ marginTop: "auto" }} />
                                                </div>
                                            </div>
                                            <div className="bg-gray-300 h-2 no-print" />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        }

                        case "empty off loading letter":
                        case "emptyoffloadingletter":
                        case "empty_off_loading_letter":
                        case "empty-off-loading-letter": {
                            const pages = Array.isArray(chunks) && chunks.length ? chunks : [undefined];
                            return (
                                <React.Fragment key={`eol-${index}`}>
                                    {pages.map((container, i) => (
                                        <React.Fragment key={`eol-${index}-page-${i}`}>
                                            <div
                                                className="a4-size"
                                                style={{ width: "210mm", height: "297mm", padding: "5mm", boxSizing: "border-box" }}
                                                ref={(el) => {
                                                    if (!el) return;
                                                    const k = refSeq.current++;
                                                    enquiryModuleRefs.current[k] = el;
                                                }}
                                                id="EMPTY OFF LOADING LETTER"
                                            >
                                                <div className="main-border" style={{ height: "100%", width: "100%", padding: "5mm", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                                                    <div className="content" style={{ flex: "1 1 auto", overflow: "visible" }}>
                                                        {EmptyOffLoadingLetter(container)}
                                                    </div>
                                                    <div className="footer" style={{ marginTop: "auto" }} />
                                                </div>
                                            </div>
                                            <div className="bg-gray-300 h-2 no-print" />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        }

                        default:
                            return null;
                    }
                })}
            </div>
        </main>
    );
}

export default RptDoLetter;
