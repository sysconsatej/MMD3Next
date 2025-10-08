const fieldData = {
  depotFields: [
    {
      label: "Code",
      name: "code",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },

    {
      label: "Empty Yard/Empty Depot",
      name: "name",
      isEdit: "true",
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Address",
      name: "address",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: "true",
    },
    {
      label: "Reference Port",
      name: "referencePortId",
      type: "dropdown",
      labelType: "referencePort",
      foreignTable: "name,tblPort",
      isEdit: "true",
    },
  ],
};

export const depot = [
  { label: "Code", value: "p.code" },
  { label: "Empty Yard/Empty Depot", value: "p.name" },
  { label: "Address", value: "p.address" },
];

export default fieldData;
