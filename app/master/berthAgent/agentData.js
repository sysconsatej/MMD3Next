// input fields data

import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

export const fieldData = {
  berthAgentFields: [
    {
      // label: "Shipping Line",
      label: "Company Name",
      name: "agentId",
      type: "dropdown",
      isEdit: true,
      required: true,
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      // where:
      //   userData?.roleCode === "shipping"
      //     ? `c.id  = '${userData?.companyId}'`
      //     : "",
      where: `c.id  = '${userData?.companyId}'`,
    },
    {
      label: "Berth Name",
      name: "berthId",
      type: "dropdown",
      isEdit: true,
      required: true,
      displayColumn: "p.code",
      joins: `left join tblPort p2 on p2.id = p.referencePortId left join tblLocation l on l.id = ${userData?.location} join tblMasterData d on p.portTypeId = d.id and d.name = 'PORT TERMINAL' and p2.name = l.name`,
      searchColumn: "p.code",
      orderBy: "p.code",
      tableName: "tblPort p",
      foreignTable: "code,tblPort",
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
    {
      label: "Auth Person Pan No",
      name: "authPersonPanNo",
      type: "text",
      isEdit: true,
    },
  ],
};

// search array

export const searchDataAray = [
  { label: "Company Name", value: "c.name" },
  { label: "Berth Name", value: "p.code" },
  { label: "Agent Code", value: "b.agentCode" },
  { label: "Line Code", value: "b.lineCode" },
  { label: "Sender Id", value: "b.senderId" },
  { label: "Port EDI Agent Code", value: "b.portEdiAgentCode" },
  { label: "Auth Person Pan No", value: "b.authPersonPanNo" },
  { label: "Updated By", value: "u.name" },
];
