import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

const fieldData = {
  igmEdiFields: [
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
    },
    {
      label: "Voyage",
      name: "voyage",
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
      label: "New Vessel",
      name: "newVessel",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
    },
    {
      label: "New Voyage",
      name: "newVoyage",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ vessel: "vesselId" }],
      orderBy: "t.voyageNo",
      isEdit: true,
    },
  ],
};

export default fieldData;
export const metaData = [
  {
    name: "itemNo",
    isEdit: true,
  },
  {
    name: "Nominated Area",
    type: "dropdown",
    tableName: "tblPort t",
    idColumn: "id",
    displayColumn: "t.name",
    searchColumn: "t.code, t.name",
    orderBy: "t.code",
    isEdit: "true",
  },
  {
    name: "DPD Desciption",
    type: "dropdown",
    tableName: "tblPort t",
    idColumn: "id",
    displayColumn: "t.name",
    searchColumn: "t.code, t.name",
    orderBy: "t.code",
    isEdit: "true",
  },
  {
    name: "Third CFS Desciption",
    type: "dropdown",
    tableName: "tblPort t",
    idColumn: "id",
    displayColumn: "t.name",
    searchColumn: "t.code, t.name",
    orderBy: "t.code",
    isEdit: "true",
  },
];
