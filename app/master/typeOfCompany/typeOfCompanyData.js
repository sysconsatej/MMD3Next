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

export default fieldData;
