import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
// paymentData.js
const fieldData = {
  paymentOfflineFields: [
    {
      label: "Payment Type",
      name: "paymentTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      where: "m.masterListName = 'tblPaymentType' AND m.name <> 'Receipt'",
      displayColumn: "m.name",
      foreignTable: "name,tblMasterData",
      required: true,
      isEdit: true,
    },
    {
      label: "TDS Amount",
      name: "tdsAmount",
      type: "number",
      isEdit: true,
    },
    {
      label: "Amount",
      name: "Amount",
      type: "number",
      required: true,
      disabled: true, // 🔹 read-only amount
      isEdit: true,
    },
    {
      label: "Bank Name",
      name: "bankName",
      type: "text",
      required: true,
      isEdit: true,
    },
    {
      label: "Branch Name",
      name: "bankBranchName",
      type: "text",
      required: true,
      isEdit: true,
    },
    {
      label: "Instrument Number",
      name: "referenceNo",
      type: "text",
      required: true,
      isEdit: true,
    },
    {
      label: "Instrument Date",
      name: "referenceDate",
      type: "date",
      required: true,
      isEdit: true,
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
      where: "m.masterListName = 'tblPaymentType' and m.name <> 'Receipt'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Upload",
      name: "path",
      type: "fileupload",
      isEdit: true,
      required: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      type: "text",
      isEdit: true,
    },
  ],
};

export default fieldData;
export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];
