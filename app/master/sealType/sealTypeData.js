const fieldData = {
  sealTypeFields: [
    {
      label: "City Name",
      name: "cityId",
      type: "dropdown",
      tableName: "tblCity t",
      displayColumn: "t.name",
      foreignTable: "name,tblCity",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "State/Region",
      name: "stateId",
      type: "dropdown",
      tableName: "tblState t",
      displayColumn: "t.name",
      foreignTable: "name,tblState",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "Country Name",
      name: "countryId",
      type: "dropdown",
      tableName: "tblCountry t",
      foreignTable: "name,tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
      required: true,
    },
  ],
};

export default fieldData;
