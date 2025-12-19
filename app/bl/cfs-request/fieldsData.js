import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export const fieldData = {
  fields: [
    {
      label: "Location",
      name: "locationId",
      type: "dropdown",
      isEdit: true,
      required: true,
      tableName: "tblLocation p",
      displayColumn: "p.name",
      orderBy: "p.name",
      where: "p.status = 1",
      foreignTable: "name,tblLocation",
    },
    {
      label: "Liner",
      name: "shippingLineId",
      type: "dropdown",
      tableName: "tblCompany t",
      displayColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCompany",
      required: true,
      isEdit: true,
    },
    {
      label: "MBL No.",
      name: "mblNo",
      type: "text",
      isEdit: true,
      required: true,
      blurFun: "getDataBasedonLinerAndBLNo",
    },
    {
      label: "MBL Date",
      name: "mblDate",
      type: "date",
      isEdit: true,
      required: true,
      disabled: true,
    },
    {
      label: "Vessel",
      name: "podVesselId",
      type: "dropdown",
      tableName: "tblVessel t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblVessel",
      isEdit: true,
      disabled: true,
    },
    {
      label: "Voyage",
      name: "podVoyageId",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ podVesselId: "vesselId" }],
      orderBy: "t.voyageNo",
      foreignTable: "voyageNo,tblVoyage",
      isEdit: true,
      disabled: true,
    },
    {
      label: "Place of Delivery",
      name: "fpdId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      orderBy: "p.name",
      foreignTable: "code-name,tblPort",
      required: true,
      disabled: true,
    },
    {
      label: "Consignee Name",
      name: "consigneeText",
      type: "text",
      isEdit: true,
    },
    {
      label: "CFS Type",
      name: "cfsTypeId",
      type: "dropdown",
      isEdit: true,
      required: true,
      displayColumn: "m.name",
      tableName: "tblMasterData m",
      where: "masterListName  = 'tblCfsType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      changeFun: "setAttachmentType",
    },
    {
      label: "CFS",
      name: "nominatedAreaId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      joins:
        "join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'CFS'",
      isEdit: true,
      foreignTable: "name,tblMasterData",
    },
    {
      label: "DPD",
      name: "dpdId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "p.name",
      joins:
        "join tblMasterData m on m.id = p.portTypeId  and m.masterListName = 'tblPortType' and m.code = 'DPD'",
      isEdit: true,
      foreignTable: "name,tblMasterData",
    },

    // will have to add   in db

    {
      label: "Nominated CB",
      name: "",
      type: "text",
      isEdit: true,
    },

    {
      label: "Status",
      name: "cfsRequestStatusId",
      type: "dropdown",
      isEdit: false,
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "masterListName = 'tblCfsStatusType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      orderBy: "m.name",
    },
  ],

  tblAttachment: [
    {
      label: "Select",
      name: "attachmentTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblCfsAttachmentType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Upload File",
      name: "path",
      type: "fileupload",
      isEdit: true,
    },
  ],
};

export const cfsData = [
  { label: "Country Code", value: "code" },
  { label: "Country Name", value: "name" },
];

export const tblColsLables = fieldData.fields.map((field) => field.label);

export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];
