import { getUserByCookies } from "@/utils";

const userData = await getUserByCookies();

const fieldData = {
  hblFields: [
    {
      label: "Location",
      name: "fpdId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name + ' - ' + ISNULL(p.code,'')",
      joins:
        "JOIN tblMasterData m ON m.id = p.portTypeId JOIN tblCountry c ON c.id = p.countryId",
      where: "m.name IN ('SEA PORT') and c.name = 'India'",
      orderBy: "p.name, p.code",
      foreignTable: "name,tblPort",
      isEdit: true,
      required: true,
    },
    {
      label: "Line",
      name: "shippingLineId",
      type: "dropdown",
      tableName: "tblCompany c",
      displayColumn: "c.name",
      searchColumn: "c.name",
      joins: `join tblCompanySubtype cs on cs.companyId = c.id join tblUser u2 on u2.id = cs.subTypeId and u2.roleCode = 'shipping'`,
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
      required: true,
    },
    {
      label: "Vessel",
      name: "podVesselId",
      type: "dropdown",
      displayColumn: "t.name",
      searchColumn: "t.name",
      tableName: "tblVessel t",
      joins: `left join tblLocation l on l.id = ${userData?.location} left JOIN tblVoyageRoute vr ON vr.vesselId = t.id left join tblPort p on p.id = vr.portOfCallId `,
      where: ` GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and p.name = l.name `,
      selectedConditions: [{ shippingLineId: "vr.companyid" }],
      orderBy: "t.name",
      changeFun: "handleChangeOnVessel",
      isEdit: true,
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
    },
    {
      label: "Mobile (Requester)",
      name: "shippingLineTelNo",
      isEdit: true,
      required: true,
    },
    {
      label: "Upload File",
      name: "upload",
      type: "fileupload",
    },
  ],
};

export default fieldData;
