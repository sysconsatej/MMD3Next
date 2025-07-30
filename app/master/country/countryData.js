const fieldData = {
  countryFields: [
    {
      label: "Country Code",
      name: "countryCode",
    },
    {
      label: "Country Name",
      name: "countryName",
    },
    {
      label: "Country Phone Code",
      name: "countryPhoneCode",
    },
    {
      label: "Active/Inactive",
      name: "activeStatus",
      type: "radio",
      radioData: [{ label: 'Yes', value: 'Y' }, { label: 'No', value: 'N' }]
    },
  ],
};

export default fieldData;
