const fieldData = {
  cityFields: [
    {
      label: "City",
      name: "name",
      isEdit: "true",
      required: true,
    },
    {
      label: "State",
      name: "stateId",
      type: "dropdown",
      tableName: "tblState",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblState",
      isEdit: "true",
      required: true,
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

export const city = [
  { label: "City Name", value: "c.name" },
  { label: "State Name", value: "s.name" },
  { label: "Country Name", value: "co.name" },
];

export default fieldData;
