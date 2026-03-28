import { getUserByCookies } from "@/utils";
const userData = getUserByCookies();
const fieldData = {
  mblFields: [
    //  {
    //     label: "Shipping Line",
    //     name: "shippingLineId",
    //     type: "dropdown",
    //     tableName: "tblCompany c",
    //     displayColumn: "c.name",
    //     orderBy: "c.name",
    //     foreignTable: "name,tblCompany",
    //     isEdit: true,
    //     required: true,
    // },
    {
      label: "Vessel",
      name: "vessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      changeFun: "handleChangeOnVessel",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "Voyage",
      name: "voyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      changeFun: "handleDropdownChange",
      selectedConditions: [{ vessel: "vesselId" }],
      where: `t.status = 1 `,
      orderBy: "t.voyageNo",
      isEdit: true,
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
    { label: "Upload File", name: "upload", type: "fileupload" },
  ],
};

export default fieldData;
