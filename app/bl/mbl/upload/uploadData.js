import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

const fieldData = {
  mblFields: [
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
      label: "Vessel",
      name: "podVesselId",
      type: "dropdown",
      displayColumn: "t.name",
      searchColumn: "t.name",
      tableName: "tblVessel t",
      joins: `left join tblLocation l on l.id = ${userData?.location} left JOIN tblVoyageRoute vr ON vr.vesselId = t.id left join tblPort p on p.id = vr.portOfCallId `,
      where: ` GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vr.companyid = ${userData?.companyId} and p.name = l.name `,
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
      selectedConditions: [{ podVesselId: "vo.vesselId" }],
      joins: `join tblVoyageRoute vr on vr.voyageId = vo.id`,
      where: `GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and vo.companyid = ${userData?.companyId} and vo.status = 1`,
      orderBy: "vo.voyageNo",
      isEdit: true,
    },
    {
      label: "Type",
      name: "submitterTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblSubmitterType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    { label: "Submitter Code", name: "shipperIdNo" },
    {
      label: "Template",
      name: "template",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblMblExcel'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    { label: "Upload File", name: "upload", type: "fileupload" },
  ],
};

export default fieldData;
