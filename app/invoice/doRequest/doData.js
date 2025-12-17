import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { layouts } from "chart.js";

export const fieldData = {
  doRequestFields: [
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
      label: "BL No",
      name: "blNo",
      isEdit: true,
      required: true,
      blurFun: "fetchInvoicePaymentByBlAndLiner",
    },

    {
      label: "Cargo Type",
      name: "cargoTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblCargoType'",
      foreignTable: "name,tblMasterData",
      orderBy: "m.name",
      isEdit: true,
    },
    {
      label: "DE StuFfing Type",
      name: "destuffingTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblStuffingDestuffingType'",
      foreignTable: "name,tblMasterData",
      orderBy: "m.name",
      isEdit: true,
    },
    {
      label: "Seaway BL/Telex BL",
      name: "seawayTelexBl",
      type: "dropdown",
      tableName: "tblMasterData",
      displayColumn: "t.name",
      where: "masterListName = 'tblSeawayTelexBL'",
      orderBy: "t.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      name: "isFreeDays",
      type: "radio",
      radioData: [
        { label: "Free Days", value: "F" },
        { label: "Do Extension", value: "D" },
      ],
      isEdit: true,
      blurFun: "duplicateHandler",
    },
    {
      label: " Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
    {
      label: "Payment not via MMD3",
      name: "paymentNotViaOdeX",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "Advance BL Submit",
      name: "paymentNotViaOdeX",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "Runner Boy",
      name: "runnerBoy",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      type: "textarea",
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Mobile No",
      name: "mobileNo",
      isEdit: true,
    },
    {
      label: "HSS Customer Name",
      name: "hssCustomerName",
      isEdit: true,
    },
    {
      label: "Factory Address",
      name: "factoryAddress",
      type: "textarea",
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Factory Location Pin",
      name: "factoryLocationPin",
      isEdit: true,
    },
  ],

  tblInvoicePayment: [
    {
      label: "Payment Type",
      name: "paymentTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      where: "m.masterListName = 'tblPaymentType' AND m.name <> 'Receipt'",
      displayColumn: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Amount",
      name: "Amount",
      type: "number",
      isEdit: true,
    },
    {
      label: "Bank Name",
      name: "bankName",
      type: "text",
      isEdit: true,
    },
    {
      label: "Branch Name",
      name: "bankBranchName",
      type: "text",
      isEdit: true,
    },
    {
      label: "Instrument Number",
      name: "referenceNo",
      type: "text",
      isEdit: true,
    },
    {
      label: "Instrument Date",
      name: "referenceDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Invoice No",
      name: "invoiceNo",
      type: "text",
      isEdit: true,
    },
    {
      label: "Status",
      name: "paymentStatusId",
      type: "dropdown",
      tableName: "tblMasterData m",
      where: "m.masterListName = 'tblPaymentStatus'",
      displayColumn: "m.name",
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
      where: "m.masterListName = 'tblInvoiceAttachmentType'",
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
      isEdit: true,
    },
  ],
};
export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];

export const advanceSearchFields = {};
