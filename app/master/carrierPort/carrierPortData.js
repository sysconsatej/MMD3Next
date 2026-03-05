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
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'SEA PORT'`,
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
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('INLAND PORT') and c.name = 'India'",
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
export const searchDataAray = [
  { label: "Shipping Line", value: "s.name" },
  { label: "Carrier", value: "c.name" },
  {
    label: "POD",
    value: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
  },
  {
    label: "FPD",
    value: "ISNULL(p1.code,'') + ' - ' + ISNULL(p1.name,'')",
  },
  { label: "Mode of Transport", value: "m.name" },
  { label: "PAN No", value: "c.panNo" },
  { label: "Bond No", value: "c.bondNo" },
  { label: "Updated By", value: "u.name" },
];
