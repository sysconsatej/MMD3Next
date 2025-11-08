// app/bl/mbl/upload/uploadData.js

// Add Template dropdown from Master Data (tblMblExcel)
const fieldData = {
    mblFields: [
        {
            label: "Location",
            name: "fpdId",
            type: "dropdown",
            tableName: "tblPort p",
            displayColumn: "p.name + ' - ' + ISNULL(p.code,'')",
            joins: "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
            where: "m.name IN ('SEA PORT') and c.name = 'India'",
            orderBy: "p.name, p.code",
            foreignTable: "name,tblPort",
            isEdit: true,
            required: true,
        },
        {
            label: "Vessel-Voyage No.",
            name: "podvesselId", // expected by controller/SP
            type: "dropdown",
            tableName: "tblVessel v",
            displayColumn: "ISNULL(v.name,'') + ' - ' + ISNULL(vo.voyageNo,'')",
            joins: "left JOIN tblVoyage vo ON vo.vesselId = v.id",
            searchColumn: "v.name",
            orderBy: "v.name, vo.voyageNo",
            foreignTable: "name,tblVessel",
            isEdit: true,
            required: true,
        },
        {
            label: "Type",
            name: "submitterTypeId",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "m.name",
            where: "m.masterListName = 'tblSubmitterType'",
            orderBy: "m.name",
            foreignTable: "name,tblMasterData",
            isEdit: true,
            required: true,
        },
        { label: "Submitter Code", name: "consigneeIdNo" },
        {
            label: "Template",
            name: "template",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "m.name",
            where: "m.masterListName = 'tblMblExcel'",
            orderBy: "m.name",
            foreignTable: "name,tblMasterData",
            isEdit: true,
            required: true,
        },
        { label: "Upload File", name: "upload", type: "fileupload" },
    ],
};

export default fieldData;
