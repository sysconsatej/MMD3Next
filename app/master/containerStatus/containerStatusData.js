const fieldData = {
  containerStatusFields: [
    // {
    //   label: "Code",
    //   name: "code",
    //   isEdit: "true",
    //   required: "true",
    //   blurFun: "duplicateHandler",
    // },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      required: "true",
      blurFun: "duplicateHandler",
    },
  ],
};

export const ContainerStatus = [
  { label: " Name", value: "m.name" },
  { label: "Code", value: "m.code" },
];

export default fieldData;
