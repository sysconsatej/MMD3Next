import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export const fieldData = {
  fields: [
    {
      label: "Location (POD)",
      name: "",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "Liner",
      name: "",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "MBL No.",
      name: "",
      type: "text",
      isEdit: true,
      required: true,
    },
    {
      label: "MBL Date",
      name: "",
      type: "date",
      isEdit: true,
      required: true,
    },
    {
      label: "Vessel-Voyage No.",
      name: "",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "Place of Delivery",
      name: "",
      type: "text",
      isEdit: true,
    },
    {
      label: "Delivery Type",
      name: "",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "CFS Type",
      name: "",
      type: "dropdown",
      isEdit: true,
      required: true,
    },
    {
      label: "CFS Name",
      name: "",
      type: "text",
      isEdit: true,
      required: true,
    },
    {
      label: "Consignee Name",
      name: "",
      type: "text",
      isEdit: true,
    },
    {
      label: "Nominated CB",
      name: "",
      type: "dropdown",
      isEdit: true,
    },
    {
      label: "Status",
      name: "",
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
