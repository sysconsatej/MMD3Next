const fieldData = {
  hblFields: [
    {
      label: "Location(POD)",
      name: "fpdId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('INLAND PORT') and c.name = 'India'",
      orderBy: "p.name",
      foreignTable: "name,tblPort",
      isEdit: true,
      required: true,
    },
    {
      label: "Line",
      name: "companyId",
      type: "dropdown",
      tableName: "tblCompany t",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
      required: true,
    },
    {
      label: "Vessel-Voyage No.",
      name: "podvesselId",
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
      label: "Mobile (Requester)",
      name: "name",
      isEdit: true,
      required: true,
    },
    {
      label: "Upload File",
      name: "upload",
      type: "uploadfile",
    },
  ],
};

export default fieldData;
