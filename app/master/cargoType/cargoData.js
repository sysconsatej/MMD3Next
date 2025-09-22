const fieldData = {
  cargoFields: [
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

export const cargoType = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
