import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();
const fieldData = {
  countryFields: [
    {
      label: "Shipping Line",
      name: "shippingLineId",
      type: "dropdown",
      isEdit: true,
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      where:
        userData?.roleCode === "shipping"
          ? `c.id  = '${userData?.companyId}'`
          : "",
      changeFun: "duplicateModuleCheck",
    },
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      joins: `left join tblLocation l on l.id = ${userData?.location} left JOIN tblVoyageRoute vr ON vr.vesselId = t.id left join tblPort p on p.id = vr.portOfCallId `,
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblVessel",
      where: ` GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vr.companyid = ${userData?.companyId} and p.name = l.name `,
      changeFun: "handleChangeOnVessel",
      isEdit: true,
    },
    {
      label: "Voyage",
      name: "voyageId",
      type: "dropdown",
      tableName: "tblVoyage vo",
      idColumn: "id",
      displayColumn: "vo.voyageNo",
      searchColumn: "vo.voyageNo",
      selectedConditions: [{ vesselId: "vo.vesselId" }],
      joins: `join tblVoyageRoute vr on vr.voyageId = vo.id`,
      where: `GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vo.companyid = ${userData?.companyId} and vo.status = 1`,
      orderBy: "vo.voyageNo",
      foreignTable: "voyageNo,tblVoyage",
      isEdit: true,
    },
    {
      label: "Module Name ",
      name: "moduleId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblModuleNote'",
      orderBy: "m.name",
      isEdit: true,
      foreignTable: "name,tblMasterData",
      changeFun: "duplicateModuleCheck",
    },
    {
      label: "Notes",
      name: "notes",
      type: "textarea",
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "s.name" },
  { label: "Location", value: "l.name" },
  { label: "Module", value: "mas.name" },
  { label: "Note", value: "m.notes" },
  { label: "Updated By", value: "u4.name" },
];

export default fieldData;
