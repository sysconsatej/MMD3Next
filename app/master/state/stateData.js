const fieldData = {
  stateFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: "true",
      blurFun: "validateStateCode",
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      required: "true",
    },
    {
      label: "Tax State Code",
      name: "taxStateCode",
      isEdit: "true",
      blurFun: "validateTaxStateCode",
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      tableName: "tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCountry",
      isEdit: true,
      required: true,
    },
  ],
};

export const state = [
  { label: "Code", value: "s.code" },
  { label: "Tax State Code", value: "s.taxStateCode" },
  { label: "Name", value: "s.name" },
  { label: "Country Name", value: "c.name" },
];

export default fieldData;
