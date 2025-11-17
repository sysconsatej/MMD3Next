// paymentData.js

const paymentOfflineFields = [
  {
    label: "Payment Type",
    name: "paymentTypeId",
    type: "dropdown",
    tableName: "tblMasterData m",
    where: "m.masterListName = 'tblPaymentType'",
    displayColumn: "m.name",
    foreignTable: "name,tblMasterData",
    required: true,
  },
  {
    label: "Amount",
    name: "Amount",
    type: "number",
    required: true,
  },
  {
    label: "Bank Name",
    name: "bankName",
    type: "text",
    required: true,
  },
  {
    label: "Branch Name",
    name: "bankBranchName",
    type: "text",
    required: true,
  },
  {
    label: "Instrument Number",
    name: "referenceNo",
    type: "text",
    required: true,
  },
  {
    label: "Instrument Date",
    name: "referenceDate",
    type: "date",
    required: true,
  },
];

export default {
  paymentOfflineFields,
};
