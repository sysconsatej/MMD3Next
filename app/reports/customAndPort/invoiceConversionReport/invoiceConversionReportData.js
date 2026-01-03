import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

const fieldData = {
  invoiceConversionFields: [
    {
      label: "Location",
      name: "podId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      isEdit: true,
    },
    {
      label: "Vessel",
      name: "vesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      changeFun: "handleChangeOnVessel",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },

    {
      label: "Voyage",
      name: "voyageId",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vessel: "vesselId" }],
      where: `t.status = 1 and t.companyid = ${userData?.companyId}`,
      orderBy: "t.voyageNo",
      isEdit: true,
    },
    {
      label: "From Date",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: " Date ",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Requested status",
      name: "statusId",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "CFS/ICD",
      name: "cfsId",
      type: "dropdown",
      isEdit: true,
    },

  ],
};
export default fieldData;
export const metaData = [];
