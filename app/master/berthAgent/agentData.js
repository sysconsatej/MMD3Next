// input fields data

import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();
const { roleCode } = userData;

export const fieldData = {
  berthAgentFields: [
    {
      label: "Shipping Line",
      name: "agentId",
      type: "dropdown",
      isEdit: true,
      required: true,
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      where: roleCode === "shipping" ? `c.id  = '${userData?.companyId}'` : "",
    },
    {
      label: "Berth Name",
      name: "berthId",
      type: "dropdown",
      isEdit: true,
      required: true,
      displayColumn: "p.name",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'PORT TERMINAL'`,
      searchColumn: "p.name",
      orderBy: "p.name",
      tableName: "tblPort p",
      foreignTable: "name,tblPort",
    },
    {
      label: "Agent Code",
      name: "agentCode",
      type: "text",
      isEdit: true,
      required: true,
    },
    {
      label: "Line Code",
      name: "lineCode",
      type: "text",
      isEdit: true,
    },
    {
      label: "Sender Id",
      name: "senderId",
      type: "text",
      isEdit: true,
    },
    {
      label: "Port Edit Agent Code",
      name: "portEdiAgentCode",
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
