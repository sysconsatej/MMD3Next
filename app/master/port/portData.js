const fieldData = {
  portFields: [
    {
      label: "Port Type",
      name: "portTypeId",
      type: "dropdown",
      foreignTable: "name,tblMasterData",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where:
        "m.masterListName = 'tblPortType' and m.name in ('INLAND PORT','SEA PORT')",
      orderBy: "m.name",
      isEdit: true,
    },
    {
      label: "Port Code",
      name: "code",
      isEdit: "true",
      blurFun: "duplicateHandler",
    },
    {
      label: "Port Name",
      name: "name",
      isEdit: "true",
      blurFun: "duplicateHandler",
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      tableName: "tblCountry t",
      displayColumn: "t.name",
      foreignTable: "name,tblCountry",
      orderBy: "t.name",
      isEdit: true,
      required: true,
    },
    {
      label: "Active/Inactive",
      name: "activeInactive",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      defaultValue: "Y", // 👈 add this

      isEdit: "true",
      required: true,
    },
    {
      label: "SEZ",
      name: "sez",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      defaultValue: "Y", // 👈 add this

      isEdit: "true",
    },
  ],
};

export const port = [
  { label: "Code", value: "p.code" },
  { label: "Port Name", value: "p.name" },
  { label: "ActiveInactive", value: "p.activeInactive" },
  { label: "Port Type Name", value: "m.name" },
  { label: "Country", value: "c.name" },
];

export default fieldData;
