const fieldData = {
  movementTypeFields: [
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

export const movementType = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
