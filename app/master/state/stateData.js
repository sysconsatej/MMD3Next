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
      name: "countryID",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
      required: "true",
    },
  ],
};

export default fieldData;
