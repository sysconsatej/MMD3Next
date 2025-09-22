const fieldData = {
  countryFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
  ],
};

export const country = [
  { label: "Country Code", value: "code" },
  { label: "Country Name", value: "name" },
];

export default fieldData;
