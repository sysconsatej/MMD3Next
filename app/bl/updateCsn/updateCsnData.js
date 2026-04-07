import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

export const fieldData = {
  mblFields: [
    {
      label: "Liner",
      name: "shippingLineId",
      type: "dropdown",
      tableName: "tblCompany c",
      displayColumn: "c.name",
      joins: `join tblCompanySubtype cs on cs.companyId = c.id join tblUser u2 on u2.id = cs.subTypeId and u2.roleCode = 'shipping'`,
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      required: true,
      isEdit: true,
    },
    {
      label: "MBL No",
      name: "mblNo",
      isEdit: true,
      required: true,
      blurFun: "getMblHandler",
    },
    {
      label: "Vessel",
      name: "podVesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      joins: `INNER JOIN tblVoyageRoute vr ON vr.vesselId = t.id and GETDATE() >= vr.gateOpenCustomer AND GETDATE() < vr.gateCloseCustomer left join tblLocation l on l.id = ${userData?.location} inner join tblPort p on p.id = vr.portOfCallId and p.name = l.name`,
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblVessel",
      selectedConditions: [{ shippingLineId: "vr.companyid" }],
      isEdit: true,
      changeFun: "handleChangeOnVessel",
      required: true,
    },
    {
      label: "Voyage",
      name: "podVoyageId",
      type: "dropdown",
      tableName: "tblVoyage vo",
      idColumn: "id",
      displayColumn: "vo.voyageNo",
      searchColumn: "vo.voyageNo",
      selectedConditions: [
        { podVesselId: "vo.vesselId", shippingLineId: "vo.companyid" },
      ],
      joins: `join tblVoyageRoute vr on vr.voyageId = vo.id and GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vo.status = 1`,
      orderBy: "vo.voyageNo",
      foreignTable: "voyageNo,tblVoyage",
      isEdit: true,
      required: true,
    },
    {
      label: "Port of Loading",
      name: "polId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
      required: true,
    },
    {
      label: "Port of Unloading",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
      required: true,
    },
    {
      label: "CSN No",
      name: "csnNo",
      isEdit: true,
      required: true,
    },
    {
      label: "CSN Date",
      name: "csnDate",
      type: "date",
      isEdit: true,
      required: true,
    },
  ],
};

export const advanceSearchFields = {
  bl: [
    {
      label: "BL No",
      name: "mblNo",
      isEdit: true,
    },
    {
      label: "POL",
      name: "polId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
    },
    {
      label: "POD",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT','INLAND PORT')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
    },
  ],
};
