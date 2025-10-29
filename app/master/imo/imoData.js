const fieldData = {
  imoFields: [
    {
      label: "UN No",
      name: "unNo",
      type: "number",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Class",
      name: "class",
      isEdit: "true",
      required: true,
    },
    {
      label: "Product Name",
      name: "properShippingName",
      isEdit: "true",
      required: true,
    },
  ],
};

export const imo = [
  { label: "UnNo", value: "i.unNo" },
  { label: "Class", value: "i.class" },
  { label: "Product Name", value: "i.properShippingName" },
];

export default fieldData;
