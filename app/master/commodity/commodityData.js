const fieldData = {
  commodityFields: [
    {
      label: "HSN Code",
      name: "code",
      isEdit: "true",
      required: "true",
      blurFun: "duplicateHandler",
    },
    {
      label: "Commodity Type",
      name: "name",
      isEdit: "true",
      required: "true",
      blurFun: "duplicateHandler",
    },
  ],
};

export const Commodity = [
  { label: " Code", value: "m.code" },
  { label: "Name", value: "m.name" },
];

export default fieldData;
