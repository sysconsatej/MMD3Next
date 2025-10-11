const fieldData = {
  stateFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: "true",
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
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      tableName: "tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
      required: true,
    }

  ],
};

export const state = [
  { label: "Code", value: "s.code" },
  { label: "Tax State Code", value: "s.taxStateCode" },
  { label: "Name", value: "s.name" },
  { label: "Country Name", value: "c.name" },
];

export default fieldData;
