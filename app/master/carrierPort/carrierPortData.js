// input fields data
export const fieldData = {
  berthAgentFields: [
    {
      label: "Shipping Line",
      name: "companyId",
      type: "dropdown",
      isEdit: true,
      required: true,
      // query
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
    },
    {
      label: "Carrier",
      name: "name",
      type: "text",
      isEdit: true,
      required: true,
    },
    {
      label: "POD",
      name: "podId",
      type: "dropdown",
      isEdit: true,
      required: true,
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
    },
    {
      label: "FPD",
      name: "fpdId",
      type: "dropdown",
      isEdit: true,
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
    },
    {
      label: "Mode of Transport",
      name: "modeId",
      type: "dropdown",
      isEdit: true,
      tableName: "tblMasterData",
      where: "masterListName ='tblMode'",
      orderBy: "name",
      foreignTable: "name,tblMasterData",
    },
    {
      label: "PAN No",
      name: "panNo",
      type: "text",
      isEdit: true,
    },
    {
      label: "Bond No",
      name: "bondNO",
      type: "text",
      isEdit: true,
    },
  ],
};

// search array
export const searchDataAray = fieldData.berthAgentFields.map((info) => {
  return {
    label: info.label,
    value: `b.${info.name}`,
  };
});
