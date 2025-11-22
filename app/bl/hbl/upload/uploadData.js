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
            label: "Vessel",
            name: "podVesselId",
            type: "dropdown",
            tableName: "tblVessel t",
            idColumn: "id",
            displayColumn: "t.name",
            searchColumn: "t.name",
            orderBy: "t.name",
            isEdit: true,
        },
        {
            label: "Voyage",
            name: "podVoyageId",
            type: "dropdown",
            tableName: "tblVoyage t",
            idColumn: "id",
            displayColumn: "t.voyageNo",
            searchColumn: "t.voyageNo",
            selectedConditions: [{ podVesselId: "vesselId" }],
            orderBy: "t.voyageNo",
            isEdit: true,
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
      type: "fileupload"
    },
  ],
};

export default fieldData;
