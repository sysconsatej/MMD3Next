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
    name: "amount",
    type: "number",
    required: true,
  },
  {
    label: "Bank Name",
    name: "bankName",
    type: "text",
  },
  {
    label: "Branch Name",
    name: "branchName",
    type: "text",
  },
  {
    label: "Instrument Number",
    name: "instrumentNumber",
    type: "text",
  },
  {
    label: "Instrument Date",
    name: "instrumentDate",
    type: "date",
  },
];

export default {
  paymentOfflineFields,
};
