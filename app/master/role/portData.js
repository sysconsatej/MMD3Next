const fieldData = {
  portFields: [
    {
      label: "Role Type",
      name: "roleCodeId",
      type: "dropdown",
      tableName: "tblUser u",
      displayColumn: "u.name",
      where: "u.status = 1 and  u.userType = 'R'",
      foreignTable: "name,tblUser",
      orderBy: "u.name",
      isEdit: true,
      required: true,
    },
    {
      label: "Name",
      name: "name",
      isEdit: "true",
      blurFun: "duplicateHandler",
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
