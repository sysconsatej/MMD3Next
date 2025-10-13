const fieldData = {
  igmEdiFields: [
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      orderBy: "t.voyageNo",
      selectedConditions: [{ "vesselId": "vesselId" }],
      isEdit: true
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true
    },
    {
      label: "New Line No",
      name: "newLineNo",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      isEdit: true,
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "From",
    isEdit: true,
  },
  {
    name: "To",
    isEdit: true,
  },
];
