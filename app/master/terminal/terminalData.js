const fieldData = {
  terminalFields: [
    {
      label: "Port code",
      name: "code",
      isEdit: "true",
      required: true,
    },
    {
      label: "Terminal Name",
      name: "name",
      isEdit: "true",
      required: true,
    },
  ],
};

export const terminal = [
  { label: "Code", value: "p.code" },
  { label: "Terminal", value: "p.name" },
];

export default fieldData;
