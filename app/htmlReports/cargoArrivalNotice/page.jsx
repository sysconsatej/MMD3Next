"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getIgmBlData } from "@/apis";
import Print from "@/components/PrintDo/page";
import "./cargoNotice.css";

export default function RptIGM() {
  return (
    <Suspense fallback={<main className="bg-gray-300 min-h-screen p-4" />}>
      <RptCargoContent />
    </Suspense>
  );
}

function RptCargoContent() {
  const searchParams = useSearchParams();
  const enquiryModuleRefs = useRef([]);
  const [reportIds] = useState(["cargoNotice"]);
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);

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

  useEffect(() => {
    if (data?.length > 0) {
      setSortedData([]);
    } else {
      setSortedData([]);
    }
  }, [data]);

  const ImportGeneralManifest = ({ data, index }) => {
    return (
      <>
        <div className="w-full bg-white border border-[#777] p-2 box-border">
          <div className="border border-[#777] flex flex-col">
            {/* Header Space */}
            <div className="h-16 border-b border-[#777]"></div>

            {/* Title */}
            <div className="text-center border-b border-[#777] py-1">
              <h1 className="text-sm font-bold">NOTICES</h1>
            </div>

            {/* Subtitle */}
            <div className="text-center border-b border-[#777] py-2 px-2">
              <h2 className="text-sm font-bold mb-1">Notice To Consignees</h2>

              <p className="text-xs font-bold">
                M.V. "ISE" Voy - 157 &nbsp;&nbsp; I.G.M. NO. &nbsp; Dtd :
              </p>

              <p className="text-xs font-bold">
                The captioned vessel is arriving at MUMBAI on with Import cargo.
              </p>
            </div>

            {/* Content */}
            <div className="p-2 text-xs text-black">
              <p className="mb-2 font-bold">
                Consignees expecting import cargoes on the captioned vessel are
                requested to present their
                <span className="uppercase"> Original Bills of Lading </span>
                duly discharged and obtain Delivery Orders. In the event of
                Mumbai Port Trust directing the shifting of the cargo from quay
                to a storage area within the docks, the same will be undertaken
                by the vessel agents at the consignee's risks and costs.
              </p>

              <p className="mb-2 pl-3">
                “Stamp duty” is payable as per the directive of the
                Superintendent of stamps.
                <br />
                Consignees will please note that the Carriers and/or their
                agents are not bound to send the individual notifications
                regarding the arrival of the vessel or their cargo.
              </p>

              <p className="mb-2">
                Consignees are requested to arrange for clearance of the cargo
                at the earliest on presentation of the packing list to our
                attending surveyors, as it is noticed that the cargo is arriving
                without proper Marks & Numbers and the same is also not
                indicated in the Bills of Lading for which the
                vessel/Owners/Agents will not be held responsible for the
                consequences arising thereof.
              </p>

              <p className="mb-2 pl-3">
                Consignees requiring steamer survey to be conducted for the
                goods discharge may contact the agents office for the same.
              </p>

              {/* Surveyor */}
              <div className="mt-2">
                The company’s Surveyors are{" "}
                <span className="font-bold">M/S. AINDLEY MARINE PVT. LTD.</span>
                <br />
                9 Kamanwala Chambers, 1st Floor, Sir P. M. Road, Fort,
                MUMBAI-400001
                <br />
                Tel: +91-22-66359901/2/3
                <br />
                Email: ops@aindley.com
              </div>

              {/* Footer */}
              <div className="mt-3 text-center">
                <div className="font-bold mb-1">General Agent</div>

                <div className="font-bold uppercase">
                  NYK INDIA PRIVATE LIMITED
                </div>

                <div className="mb-2">
                  Unit no.1205-1208, 12th floor, Windfall Sahar Plaza Complex
                  <br />
                  Sir M.V. Road, J.B. Nagar, Andheri Kurla Road,
                  <br />
                  Andheri East, Mumbai
                </div>

                <div className="font-bold">Contact details</div>
                <div>Board : +91 22-46138181</div>

                <div>
                  website{" "}
                  <span className="underline">www.nyklineindia.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const pdfNameBase = "Cargo Arrival Notice";

  return (
    <main className="bg-gray-300 min-h-screen p-4">
      <Print
        apiBaseUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
        printOrientation="landscape"
        pdfFilename={pdfNameBase}
        enquiryModuleRefs={enquiryModuleRefs}
        useRefsHtml
        cssPath="/style/cargoNotice.css"
      />

      <div>
        {reportIds.map((reportId, index) => (
          <React.Fragment key={`report-${reportId}-${index}`}>
            {(() => {
              switch (reportId) {
                case "cargoNotice": {
                  return (
                    <div className="flex flex-col items-center gap-4 bg-gray-300 min-h-screen">
                      {chunks.map((group, chunkIndex) => {
                        return (
                          <React.Fragment key={`${chunkIndex}`}>
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
