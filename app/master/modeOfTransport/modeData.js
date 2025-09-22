const fieldData = {
  modeOfTransportFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: "true",
      blurFun: "duplicateHandler",
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      required: "true",
      blurFun: "duplicateHandler",
    },
  ],
};

export const modeOfTransport = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
