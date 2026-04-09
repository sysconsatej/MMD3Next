import { getUserByCookies } from "@/utils";
import { Label } from "@mui/icons-material";
const userData = getUserByCookies();

const isAdmin = userData?.roleCode === "admin";

const fieldData = {
  igmGenerationFields: [
    ...(isAdmin
      ? [
          {
            label: "Liner",
            name: "shippingLineId",
            type: "dropdown",
            tableName: "tblCompany c",
            idColumn: "id",
            displayColumn: "c.name",
            searchColumn: "c.name",
            joins: `join tblCompanySubtype cs on cs.companyId = c.id join tblUser u2 on u2.id = cs.subTypeId and u2.roleCode = 'shipping'`,
            orderBy: "c.name",
            isEdit: true,
          },
        ]
      : []),
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
      changeFun: isAdmin ? "handleDropdownChange" : "handleChangeOnVessel",
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      changeFun: "handleDropdownChange",
      where: [
        "t.status = 1",
        !isAdmin ? `t.companyid = ${userData?.companyId}` : null,
      ]
        .filter(Boolean)
        .join(" and "),
      orderBy: "t.voyageNo",
      isEdit: true,
      selectedConditions: isAdmin
        ? [{ vessel: "vesselId", shippingLineId: "t.companyid" }]
        : [{ vessel: "vesselId" }],
    },
    {
      label: "POD",
      name: "pod",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      changeFun: "handleDropdownChange",
      joins: `join tblMasterData d on p.portTypeId = d.id and d.name = 'SEA PORT' join tblVoyageRoute v on v.portOfCallId = p.id`,
      selectedConditions: [{ voyage: "v.voyageId" }],
      searchColumn: "p.name",
      orderBy: "p.name",
      isEdit: true,
    },
    {
      label: "FPD",
      name: "fpd",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "CFS",
      name: "cfsId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins: `join tblMasterData m on m.id = p.portTypeId and m.masterListName = 'tblPortType' and m.code = 'CFS'`,
      where: `p.status = 1 ${!isAdmin ? `and p.companyId = ${userData?.companyId}` : ""}`,
      selectedConditions: isAdmin
        ? [{ shippingLineId: "p.companyId" }, { pod: "p.referencePortId" }]
        : [{ pod: "p.referencePortId" }],
      isEdit: true,
    },
    {
      label: "From Date",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "To Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
  ],
};
export default fieldData;
export const metaData = [];
