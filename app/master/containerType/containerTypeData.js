const fieldData = {
  containerSizeFields: [
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

export const ContainerType = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
