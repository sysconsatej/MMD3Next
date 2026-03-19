"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDataWithCondition } from "@/apis";
import Print from "@/components/PrintDo/page";
import "./cargoNotice.css";
import { getUserByCookies } from "@/utils";

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
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    async function initialize() {
      const userData = getUserByCookies();
      const ids = searchParams.get("recordId") || "";
      const idsArr = ids.split(",");
      const obj = {
        columns:
          "v.name vessel, vo.voyageNo voyage, c.name companyName, c.address companyAddress, c.telephoneNo companyTel, c.website companyWebsite, vr.igmNo igmNo, vr.igmDate igmDate, p.name portOfCallId ",
        tableName: "tblVessel v",
        joins: `left join tblVoyage vo on vo.vesselId = v.id left join tblCompany c on c.id = ${userData?.companyId} left join tblVoyageRoute vr on vr.vesselId = v.id and vr.voyageId = vo.id left join tblPort p on p.id = vr.portOfCallId `,
        whereCondition: `v.id = ${idsArr[0]} and vo.id = ${idsArr[1]} and vr.companyid = ${userData?.companyId} `,
      };

      const { data, success } = await getDataWithCondition(obj);
      console.log("data?.[0]", data?.[0]);
      console.log("success", success);
      if (success) setReportData(data?.[0]);
    }
    initialize();
  }, []);

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
                {reportData?.vessel} Voy - {reportData?.voyage} &nbsp;&nbsp;
                I.G.M. NO. {reportData?.igmNo} &nbsp; Dtd :{" "}
                {reportData?.igmDate}
              </p>

              <p className="text-xs font-bold">
                The captioned vessel is arriving at {reportData?.portOfCallId}{" "}
                on with Import cargo.
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
              {/* <div className="mt-2">
                The company’s Surveyors are{" "}
                <span className="font-bold">M/S. AINDLEY MARINE PVT. LTD.</span>
                <br />
                9 Kamanwala Chambers, 1st Floor, Sir P. M. Road, Fort,
                MUMBAI-400001
                <br />
                Tel: +91-22-66359901/2/3
                <br />
                Email: ops@aindley.com
              </div> */}

              {/* Footer */}
              <div className="mt-3 text-center w-full flex item-center justify-center">
                <div className="w-2/4">
                  <div className="font-bold mb-1">General Agent</div>

                  <div className="font-bold uppercase">
                    {reportData?.companyName}
                  </div>

                  <div className="mb-2">{reportData?.companyAddress}</div>

                  <div className="font-bold">Contact details</div>
                  <div>Board : {reportData?.companyTel}</div>

                  <div>
                    website
                    <span className="underline">
                      {reportData?.companyWebsite}
                    </span>
                  </div>
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
                      <div
                        ref={(el) => (enquiryModuleRefs.current[index] = el)}
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
                        <ImportGeneralManifest />
                      </div>

                      <div className="bg-gray-300 h-2 no-print" />
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
