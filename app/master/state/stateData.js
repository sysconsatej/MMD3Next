const fieldData = {
  stateFields: [
    {
      label: "State Code",
      name: "code",
      isEdit:"true",
    },
    {
      label: "Tax State Code",
      name: "taxStateCode",
      isEdit:"true",
    },
    {
      label: "State Name",
      name: "name",
      isEdit:"true",
    },
    {
      label: "Country",
      name: "countryID",
      type: "dropdown",
      labelType: "country",
      foreignTable:'name,tblCountry',
      isEdit:"true",
    },
  ],
};

export default fieldData;
