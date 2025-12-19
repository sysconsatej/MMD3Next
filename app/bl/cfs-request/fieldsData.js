import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export const fieldData = {
  fields: [
    {
      label: "Location (POD)",
      name: "locationId",
      type: "dropdown",
      isEdit: true,
      required: true,
      tableName: "tblLocation p",
      displayColumn: "p.name",
      orderBy: "p.name",
      where: "p.status = 1",
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
    },
    {
      label: "MBL Date",
      name: "mblDate",
      type: "date",
      isEdit: true,
      required: true,
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
    },
    {
      label: "Place of Delivery",
      name: "fpdId",
      type: "dropdown",
      tableName: "tblPort p",
      isEdit: true,
    },
    {
      label: "Consignee Name",
      name: "",
      type: "text",
      isEdit: true,
    },
    {
      label: "CFS Type",
      name: "cfsTypeId",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "CFS",
      name: "",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "DPD",
      name: "",
      type: "dropdown",
      isEdit: true,
    },

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
      where: "m.masterListName = 'tblBlTypeAttachment'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Upload File",
      name: "path",
      type: "fileupload",
      isEdit: true,
      required: true,
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
