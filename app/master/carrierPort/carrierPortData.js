import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

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
      where:
        userData?.roleCode === "shipping"
          ? `c.id  = '${userData?.companyId}'`
          : "",
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
      blurFun: "validatePanCard",
    },
    {
      label: "Bond No",
      name: "bondNo",
      type: "text",
      isEdit: true,
    },
    {
      label: "Default ICD",
      name: "defaultCfs",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      isEdit: true,
      showFieldonSearch: false,
    },
    {
      label: "SCMRT Bond NO",
      name: "scmtrBondNo",
      type: "text",
      isEdit: true,
      showFieldonSearch: false,
    },
  ],
};

// search array
export const searchDataAray = fieldData.berthAgentFields
  .filter((i) => i.showFieldonSearch !== false)
  .map((info) => {
    return {
      label: info.label,
      value: `b.${info.name}`,
    };
  });
