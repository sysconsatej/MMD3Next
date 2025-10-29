const fieldData = {
  cityFields: [
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
      // NEW: wire the handler
      changeFun: "toggleStateRequired",
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
      required: true, // default; your handler will set this to false for foreign countries
    },
    {
      label: "City",
      name: "name",
      isEdit: "true",
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
