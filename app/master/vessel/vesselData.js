const fieldData = {
  vesselFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "IMO Code",
      name: "imoCode",
      isEdit: true,
      required: true,
    },
    {
      label: "Nationality",
      name: "nationalityId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },
    {
      label: "Call Sign",
      name: "callSign",
      isEdit: true,
      required: true,
    },
    {
      label: "Build Year",
      name: "buildYear",
      type: "number",
      isEdit: true,
    },
    {
      label: "Gross Tonnage",
      name: "grossTonnage",
      type: "number",
      isEdit: true,
    },
    {
      label: "Net Tonnage",
      name: "netTonnage",
      type: "number",
      isEdit: true,
    },
  ],
};

export const vessel = [
  { label: " Code", value: "v.code" },
  { label: "Name", value: "v.name" },
  { label: "Nationality", value: "c.name" },
  { label: "CallSign", value: "v.callSign" },
  { label: "ImoCode", value: "v.imoCode" },
];

export default fieldData;
