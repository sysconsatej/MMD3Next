const fieldData = {
  companyTypeFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "SubType",
      name: "name",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
  ],
};

export const typeOfCompany = [
  { label: "Company SubType Code", value: "m.code" },
  { label: "Company SubType", value: "m.name" },
];

export default fieldData;
