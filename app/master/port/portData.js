const fieldData = {
  portFields: [
    {
      label: "Port/Location",
      name: "portTypeId",
      type: "dropdown",
      labelType: "name,tblPortType",
      foreignTable: "name,tblMasterData",
      isEdit: "true",
    },
    {
      label: "Port Code",
      name: "code",
      isEdit: "true",
    },
    {
      label: "Port Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Country",
      name: "countryId",
      type: "dropdown",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: "true",
      required: true,
    },
    {
      label: "Active/Inactive",
      name: "activeInactive",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      isEdit: "true",
      required: true,
    },
  ],
};

export const port = [
  { label: "Code", value: "p.code" },
  { label: "Port Name", value: "p.name" },
  { label: "ActiveInactive", value: "p.activeInactive" },
  { label: "Port Type Name", value: "m.name" },
  { label: "Country", value: "c.name" },
];

export default fieldData;
