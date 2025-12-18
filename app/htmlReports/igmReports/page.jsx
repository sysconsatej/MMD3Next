"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getIgmBlData } from "@/apis";
import Print from "@/components/PrintDo/page";
import "./igmRep.css";

export default function RptIGM() {
  return (
    <Suspense fallback={<main className="bg-gray-300 min-h-screen p-4" />}>
      <RptIGMContent />
    </Suspense>
  );
}

function RptIGMContent() {
  const searchParams = useSearchParams();
  const enquiryModuleRefs = useRef([]);
  const rowRefsByGroup = useRef({});

  const [reportIds] = useState(["Import General Manifest"]);

  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [paginatedChunks, setPaginatedChunks] = useState([]);

  const recordIds = useMemo(() => {
    const raw = searchParams.get("recordId") || "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [searchParams]);

  useEffect(() => {
    if (!recordIds.length) {
      setData([]);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await getIgmBlData({ json: recordIds.join(",") });
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (alive) setData(rows);
        console.log("getIgmBlData res:", res);
      } catch (err) {
        console.error("getIgmBlData error:", err);
        if (alive) setData([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [recordIds]);

  function formatDateToYMD(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const PAGE_HEIGHT = 791;
  const HEADER_HEIGHT = 160;
  const FOOTER_HEIGHT = 120;
  const DEFAULT_ROW_HEIGHT = 70;
  const CONTAINER_ROW_HEIGHT = 70;

  function groupSortedBlData(rows) {
    const carrierRank = (v) => {
      const s = String(v ?? "")
        .trim()
        .toUpperCase();
      if (s === "LOCAL") return 0;
      if (s === "SMTP") return 1;
      if (s === "TP") return 2;
      if (s === "") return 3;
      return 4;
    };
    const text = (v) => String(v ?? "");
    const toNum = (v) => {
      if (v == null || v === "") return Infinity;
      const n = Number(String(v).replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : Infinity;
    };
    const getPLR = (o) => o.plrName ?? o.plr ?? "";
    const getFPD = (o) => o.fpdName ?? o.fpd ?? "";

    const arr = [...(rows || [])].sort((a, b) => {
      const r1 =
        carrierRank(a.movementCarrier) - carrierRank(b.movementCarrier);
      const rLn = toNum(a.lineNo) - toNum(b.lineNo);
      const r2 = text(getPLR(a)).localeCompare(text(getPLR(b)), undefined, {
        sensitivity: "base",
      });
      const r3 = text(getFPD(a)).localeCompare(text(getFPD(b)), undefined, {
        sensitivity: "base",
      });
      return r1 || rLn || r2 || r3;
    });

    const groups = [];
    let currentKey = null;
    let bucket = [];

    for (const item of arr) {
      const key = [item.movementCarrier || "", getPLR(item), getFPD(item)].join(
        "|||"
      );
      if (key !== currentKey) {
        if (bucket.length) {
          groups.push({
            movementCarrier: bucket[0].movementCarrier || "",
            plrName: getPLR(bucket[0]),
            fpdName: getFPD(bucket[0]),
            VesselVoyageName: bucket[0].VesselVoyageName || "",
            igmNo: bucket[0].igmNo ?? "",
            igmDate: bucket[0].igmDate ?? "",
            lineNo: bucket[0].lineNo ?? "",
            records: bucket,
          });
        }
        currentKey = key;
        bucket = [item];
      } else {
        bucket.push(item);
      }
    }

    if (bucket.length) {
      groups.push({
        movementCarrier: bucket[0].movementCarrier || "",
        plrName: getPLR(bucket[0]),
        fpdName: getFPD(bucket[0]),
        VesselVoyageName: bucket[0].VesselVoyageName || "",
        igmNo: bucket[0].igmNo ?? "",
        igmDate: bucket[0].igmDate ?? "",
        lineNo: bucket[0].lineNo ?? "",
        records: bucket,
      });
    }

    return groups;
  }

  function estimateRecordHeight(record) {
    const goodsDescLines = Math.ceil((record.goodsDesc?.length || 0) / 40);
    const marksLines = Math.ceil((record.marksNos?.length || 0) / 50);
    const consigneeLines = Math.ceil(
      ((record.consigneeText?.length || 0) +
        (record.consigneeAddress || "").length) /
      60
    );
    const containerLines =
      (record.tblBlContainer?.length || 0) * CONTAINER_ROW_HEIGHT;

    const textHeight = (goodsDescLines + marksLines + consigneeLines) * 15;
    return DEFAULT_ROW_HEIGHT + textHeight + containerLines;
  }

  function chunkRecordsByHeight(
    records,
    rowRefsByGroup = {},
    groupKey = "",
    showFooterOnLastChunk = true
  ) {
    const chunks = [];
    let currentChunk = [];
    let currentHeight = 0;

    const calcBodyHeight = (isLastChunk = false) =>
      PAGE_HEIGHT -
      HEADER_HEIGHT -
      (isLastChunk && showFooterOnLastChunk ? FOOTER_HEIGHT : 0);

    const estimatedHeights = records.map(estimateRecordHeight);
    let index = 0;

    while (index < records.length) {
      const record = records[index];
      const estimatedHeight = estimatedHeights[index];
      const isLastRecord = index === records.length - 1;
      const isEmptyChunk = currentChunk.length === 0;
      const pageBodyHeight = calcBodyHeight(isLastRecord && isEmptyChunk);

      if (estimatedHeight > pageBodyHeight) {
        const containerCount = record.tblBlContainer?.length || 0;

        const maxContainersPerPage = Math.floor(
          (pageBodyHeight - DEFAULT_ROW_HEIGHT - 30) / CONTAINER_ROW_HEIGHT
        );
        const totalChunks = Math.ceil(
          containerCount / Math.max(1, maxContainersPerPage)
        );

        for (let i = 0; i < totalChunks; i++) {
          const slicedContainers = record.tblBlContainer.slice(
            i * maxContainersPerPage,
            (i + 1) * maxContainersPerPage
          );

          const partialRecord = {
            ...record,
            tblBlContainer: slicedContainers,
            isSplit: true,
            hideHeader: i > 0,
            hideHeaderData: i > 0,
            splitIndex: i + 1,
            splitTotal: totalChunks,
          };

          chunks.push([partialRecord]);
        }

        index++;
        continue;
      }

      if (currentHeight + estimatedHeight <= pageBodyHeight) {
        currentChunk.push(record);
        currentHeight += estimatedHeight;
        index++;
      } else {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        currentChunk = [];
        currentHeight = 0;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  useEffect(() => {
    if (data?.length > 0) {
      const grouped = groupSortedBlData(data);
      setSortedData(grouped);
    } else {
      setSortedData([]);
    }
  }, [data]);

  useEffect(() => {
    if (sortedData.length > 0) {
      const newChunks = [];
      sortedData.forEach((group) => {
        const groupKey = [
          group.movementCarrier,
          group.plrName,
          group.fpdName,
        ].join("|||");
        const recordChunks = chunkRecordsByHeight(
          group.records,
          rowRefsByGroup,
          groupKey,
          true
        );

        recordChunks.forEach((chunk, index) => {
          const isLastChunkOfGroup = index === recordChunks.length - 1;
          newChunks.push({
            movementCarrier: group.movementCarrier,
            plrName: group.plrName,
            fpdName: group.fpdName,
            groupKey,
            chunkIndex: index,
            isLastChunkOfGroup,
            records: chunk,
          });
        });
      });

      setPaginatedChunks(newChunks);
    } else {
      setPaginatedChunks([]);
    }
  }, [sortedData]);

  const ImportGeneralManifest = ({ data, index }) => {
    return (
      <>
        <div>
          <h1 className="text-center text-black font-bold text-sm">
            IMPORT GENERAL MANIFEST
          </h1>
          <h2 className="text-center text-black font-bold text-sm ">
            CARGO DECLARATION
          </h2>
          <div className="flex w-full">
            <div style={{ width: "52%" }}>
              <h2 className="text-black font-bold text-sm text-right">
                FORM III
              </h2>
            </div>
            <div style={{ width: "48%" }}>
              <p className="text-black text-xs text-right pr-5">
                Page {index + 1}
              </p>
            </div>
          </div>
          <p className="text-center text-black text-xs mt-2">
            See Regulation 3 and 4
          </p>
        </div>

        <div
          className="flex mt-2"
          style={{ width: "100%", color: "black", fontSize: "9px" }}
        >
          <div style={{ width: "32%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">
                  Name of the Shipping Line:
                </p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.shippingLine || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold text-[9px]">
                  1. Name of the Ship :
                </p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.podVessel || ""}</div>
            </div>
            <div className="flex mb-2">
              <div className="text-[9px]" style={{ width: "40%" }}>
                <p className="text-black font-bold text-[9px]">
                  3. IMO Code of Vessel :
                </p>
              </div>
              <div className="text-[9px]" style={{ width: "60%" }}></div>
            </div>
          </div>

          <div style={{ width: "32%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">Name of the Agent :</p>
              </div>
              <div style={{ width: "60%" }}></div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">
                  2. Port where report is made :
                </p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.pod + " ( " + data[0]?.podCode + " )" || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">4. Name of the Master :</p>
              </div>
              <div style={{ width: "60%" }}></div>
            </div>
          </div>

          <div style={{ width: "19%" }}>
            <div className="flex mt-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">5 Port of Loading :</p>
              </div>
              <div style={{ width: "60%" }}>
                <p className="text-black">{data[0]?.pol + " ( " + data[0]?.polCode + " )" || ""}</p>
              </div>
            </div>
            <div className="flex mt-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">
                  6 Authorised Sea Carrier Code :
                </p>
              </div>
              <div style={{ width: "60%" }}>
                <p className="text-black">{data[0]?.carrierCode || ""}</p>
              </div>
            </div>
            <div className="flex mt-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">
                  7 VCN No :
                </p>
              </div>
              <div style={{ width: "60%" }}>
                <p className="text-black">{data[0]?.customVcnNo || ""}</p>
              </div>
            </div>
          </div>

          <div style={{ width: "17%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">IGM No.:</p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.igmNo || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">IGM Date:</p>
              </div>
              <div style={{ width: "60%" }}>
                {formatDateToYMD(data[0]?.igmDate)}
              </div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">Voyage No:</p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.podVoyage || ""}</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const ImportGeneralManifestGrid = ({
    sortedData: gridData,
    groupedHeaderName,
    groupKey,
    rowRefsByGroup,
    hideHeaderData,
    headerData = {},
  }) => {
    if (!rowRefsByGroup.current[groupKey]) {
      rowRefsByGroup.current[groupKey] = [];
    }
    const fpdName = (groupedHeaderName?.fpdName || "").trim();
    const via = (data?.[0]?.via || "").trim();

    const showVia = via && fpdName.toLowerCase() !== via.toLowerCase();

    return (
      <>
        <div
          className="flex mt-2 border-black border-t border-b border-l border-r"
          style={{ width: "100%", color: "black", fontSize: "8px" }}
        >
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            6.Line No
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            7. B/L No. and Date
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            8. No.and Nature of Packages
          </div>
          <div className="border-black border-r p-1" style={{ width: "15%" }}>
            9. Marks and Numbers
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            10. Gross Wt. (Kgs.)
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            11. Description of goods
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            12. Name of Consignee/Importer, If different
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            13. Date of presentation of bill of entry
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            14. Name of Custom House Agents
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            15. Rotation No.: Cash/Deposit W.R.N
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            16. No. of Packages on which duty colld or warehoused
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            17. Year: (To be filled by Port Trust) No. of packages discharged
          </div>
          <div className="p-1" style={{ width: "5%" }}>
            18. Remarks
          </div>
        </div>

        {groupedHeaderName && (
          <>
            <div
              className="text-center mt-1 mb-1 font-bold"
              style={{ fontSize: "8px" }}
            >
              <p className="text-black">
                {groupedHeaderName?.movementCarrier} CARGO FROM{" "}
                {groupedHeaderName?.plrName} TO {groupedHeaderName?.fpdName}{" "}
                {showVia ? (
                  <>
                    VIA {data?.[0]?.via || ""}
                  </>
                ) : null}
              </p>
              {(headerData?.polVessel || headerData?.polVoyage) && (
                <p className="text-black">
                  EX VESSEL {headerData?.polVessel || ""} VOYAGE{" "}
                  {headerData?.polVoyage || ""}
                </p>
              )}
            </div>
            <hr className="hrRow border-black border-bold" />
          </>
        )}

        {gridData.map((item, index) => (
          <React.Fragment key={`${item.blNo || item.lineNo || "row"}-${index}`}>
            {!hideHeaderData && (
              <div
                ref={(el) => (rowRefsByGroup.current[groupKey][index] = el)}
                className="flex"
                style={{ fontSize: "9px", color: "black" }}
              >
                <div className="p-1 wordBreak" style={{ width: "5%" }}>
                  <div className="wordBreak">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      {item.movementCarrier || ""}
                      <br />
                      <br />
                      {item.lineNo || ""}
                    </p>
                  </div>
                </div>
                <div className="p-1 wordBreak" style={{ width: "10%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.blNo || ""}
                    <br /> {formatDateToYMD(item.blData)}
                  </p>
                </div>
                <div className="p-1 wordBreak" style={{ width: "5%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.noOfPackages || ""} <br />{" "}
                    {item.typeOfPackage || ""}
                  </p>
                </div>
                <div className="p-1 wordBreak" style={{ width: "15%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.marksNos || ""}
                  </p>
                </div>
                <div className="p-1" style={{ width: "5%" }}>
                  {item.grossWt || ""}KGS.
                </div>
                <div className="p-1" style={{ width: "25%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.goodsDesc || ""}
                  </p>
                </div>
                <div className="p-1" style={{ width: "35%" }}>
                  <div className="wordBreak flex">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      <span className="font-bold">Consignee : </span>
                      {item.consigneeText || ""}<br />
                      {item.consigneeAddress || ""}
                    </p>
                  </div>
                  <div className="mt-2 wordBreak flex">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      <span className="font-bold">Notify Party :</span>
                      {item.notifyPartyName || ""}<br />
                      {item.notifyPartyAddress || ""}
                    </p>
                  </div>
                </div>
                <div className="p-1" style={{ width: "5%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.remarks || ""}
                  </p>
                </div>
              </div>
            )}

            {item.tblBlContainer?.length > 0 &&
              item.tblBlContainer.map((containerItem, containerIndex) => (
                <div
                  key={`${containerItem.containerNo || "cont"
                    }-${containerIndex}`}
                  className="flex"
                  style={{ fontSize: "8px", color: "black", width: "30%" }}
                >
                  <div style={{ width: "20%" }}>
                    {containerItem.containerNo || ""}
                  </div>
                  <div style={{ width: "10%" }}>
                    {item.containerStatusName || ""}
                  </div>
                  <div style={{ width: "20%" }}>
                    {containerItem.containerSealNo || ""}
                  </div>
                  <div style={{ width: "10%" }}>
                    {containerItem.containerSize || ""}
                    {" / "}
                    {containerItem.ContainerType || ""}
                  </div>
                  <div style={{ width: "10%" }}>
                    {containerItem.noOfPackages || ""}
                  </div >
                  <div style={{ width: "25%" }}>
                    {containerItem.containerGrossWT || ""}KGS.
                  </div>
                  <div style={{ width: "5%" }}>
                    {containerItem.containerGrossWTUnit || ""}
                  </div>
                </div>
              ))}
          </React.Fragment>
        ))}
      </>
    );
  };

  const ImportGeneralManifestFooter = () => {
    return (
      <>
        <div className="mt-6 mb-2" style={{ fontSize: "9px", width: "70%" }}>
          <p className="text-black" style={{ fontSize: "9px" }}>
            We hereby certify that Item List are on account of our principals.
            We, as agents are responsible for the cargo manifested under the
            above items and will be liable for any penalty or other dues in case
            of any shortland / survey shortages. We certify that all items
            indicated on this hard copy of IGM have been fully represented in
            the magnetic medium.
          </p>
        </div>
        <div className="flex mt-4">
          <p className="text-black" style={{ fontSize: "9px" }}>
            To be filled by Customs house
          </p>
          <p className="text-black ml-8" style={{ fontSize: "9px" }}>
            Date and Signature by the Master, authorized agent
          </p>
        </div>
        <div>
          <p className="text-black mt-4" style={{ fontSize: "9px" }}>
            For{" "}
          </p>
        </div>
        <div>
          <p className="text-black mt-15" style={{ fontSize: "9px" }}>
            As Agents
          </p>
        </div>
      </>
    );
  };

  const headerRow0 = data?.[0] || {};
  const pdfNameBase = `IGM_${headerRow0?.igmNo || "Report"}_${headerRow0?.VesselVoyageName || ""
    }`.replace(/[\\/:*?"<>|]+/g, "_");

  return (
    <main className="bg-gray-300 min-h-screen p-4">
      <Print
        apiBaseUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
        printOrientation="landscape"
        pdfFilename={pdfNameBase}
        enquiryModuleRefs={enquiryModuleRefs}
        useRefsHtml
        cssPath="/style/igmRep.css"
      />

      <div>
        {reportIds.map((reportId, index) => (
          <React.Fragment key={`report-${reportId}-${index}`}>
            {(() => {
              switch (reportId) {
                case "Import General Manifest": {
                  const PAGE_HEIGHT_PX = 650;
                  const headerHeight = 160;
                  const footerHeight = 120;
                  const rowBaseHeight = 70;
                  const CONTAINER_ROW_HEIGHT_PAGE = 20;

                  function estimateRecordHeightPage(record) {
                    const goodsDescLines = Math.ceil(
                      (record.goodsDesc?.length || 0) / 40
                    );
                    const marksLines = Math.ceil(
                      (record.marksNos?.length || 0) / 50
                    );
                    const consigneeLines = Math.ceil(
                      ((record.consigneeText?.length || 0) +
                        (record.consigneeAddress?.length || 0)) /
                      60
                    );
                    const containerLines =
                      (record.tblBlContainer?.length || 0) *
                      CONTAINER_ROW_HEIGHT_PAGE;
                    const textHeight =
                      (goodsDescLines + marksLines + consigneeLines) * 15;
                    return DEFAULT_ROW_HEIGHT + textHeight + containerLines;
                  }

                  const chunks = [];

                  sortedData.forEach((groupItem) => {
                    const { movementCarrier, plrName, fpdName, records } =
                      groupItem;
                    const groupKey = [
                      movementCarrier || "",
                      plrName || "",
                      fpdName || "",
                    ].join("|||");

                    if (!Array.isArray(records)) return;

                    let currentHeight = 0;
                    let pageRecords = [];

                    records.forEach((record) => {
                      const containerCount = record.tblBlContainer?.length || 0;
                      const totalRowHeight = estimateRecordHeightPage(record);

                      if (
                        totalRowHeight >
                        PAGE_HEIGHT_PX - headerHeight - footerHeight
                      ) {
                        const maxContainersPerPage = Math.floor(
                          (PAGE_HEIGHT_PX -
                            headerHeight -
                            footerHeight -
                            rowBaseHeight) /
                          CONTAINER_ROW_HEIGHT_PAGE
                        );
                        const totalChunks = Math.ceil(
                          containerCount / Math.max(1, maxContainersPerPage)
                        );

                        for (let i = 0; i < totalChunks; i++) {
                          const slicedContainers =
                            record.tblBlContainer?.slice(
                              i * maxContainersPerPage,
                              (i + 1) * maxContainersPerPage
                            ) || [];

                          const partialRecord = {
                            ...record,
                            tblBlContainer: slicedContainers,
                            isSplit: true,
                            hideHeader: i > 0,
                            hideHeaderData: i > 0,
                            splitIndex: i + 1,
                            splitTotal: totalChunks,
                          };

                          chunks.push({
                            groupKey,
                            movementCarrier,
                            plrName,
                            fpdName,
                            records: [partialRecord],
                          });
                        }
                      } else {
                        if (
                          currentHeight + totalRowHeight >
                          PAGE_HEIGHT_PX - headerHeight - footerHeight
                        ) {
                          chunks.push({
                            groupKey,
                            movementCarrier,
                            plrName,
                            fpdName,
                            records: pageRecords,
                          });
                          currentHeight = totalRowHeight;
                          pageRecords = [record];
                        } else {
                          pageRecords.push(record);
                          currentHeight += totalRowHeight;
                        }
                      }
                    });

                    if (pageRecords.length > 0) {
                      chunks.push({
                        groupKey,
                        movementCarrier,
                        plrName,
                        fpdName,
                        records: pageRecords,
                      });
                    }
                  });

                  return (
                    <div className="flex flex-col items-center gap-4 bg-gray-300 min-h-screen">
                      {chunks.map((group, chunkIndex) => {
                        const isLastChunkOfGroup =
                          chunkIndex ===
                          chunks.reduce(
                            (lastIdx, g, idx) =>
                              g.groupKey === group.groupKey ? idx : lastIdx,
                            -1
                          );

                        return (
                          <React.Fragment
                            key={`${group.groupKey}-page-${chunkIndex}`}
                          >
                            <div
                              ref={(el) =>
                                (enquiryModuleRefs.current[chunkIndex] = el)
                              }
                              className="bg-white shadow-md p-4 border border-gray-300 print:break-after-page relative mb-8"
                              style={{
                                width: "297mm",
                                height: "210mm",
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                margin: "auto",
                                overflow: "hidden",
                                pageBreakAfter: "always",
                              }}
                            >
                              <ImportGeneralManifest
                                data={group.records}
                                index={chunkIndex}
                              />

                              <ImportGeneralManifestGrid
                                sortedData={group.records}
                                groupedHeaderName={group}
                                groupKey={group.groupKey}
                                rowRefsByGroup={rowRefsByGroup}
                                hideHeaderData={
                                  group.records[0]?.hideHeaderData
                                }
                                headerData={{
                                  polVessel: headerRow0?.polVessel,
                                  polVoyage: headerRow0?.polVoyage,
                                }}
                              />

                              {isLastChunkOfGroup && (
                                <ImportGeneralManifestFooter />
                              )}
                            </div>

                            <div className="bg-gray-300 h-2 no-print" />
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                }
                default:
                  return null;
              }
            })()}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
