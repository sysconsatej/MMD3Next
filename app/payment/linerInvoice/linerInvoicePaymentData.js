export const invoicePaymentSearchColumns = [
  { label: "BL No", value: "b.mblNo" },
  { label: "Beneficiary Name", value: "c.name" },
  { label: "Invoice No", value: "i.invoiceNo" },
  { label: "Category", value: "cat.name" },
];
export function paymentStatusColor(status) {
  const map = {
    "Payment Confirmation Requested": "#4E61D3", // Blue
    "Payment Confirmed": "green", // Green
    "Payment Rejected": "#DC0E0E", // Red
  };

  return map[status] || "inherit";
}
// --- Advanced search config for Invoice Payment ---
export const advanceSearchFieldsPayment = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Status",
      name: "statusId",
      type: "multiselect",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};
export const advanceSearchFields = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Status",
      name: "statusId",
      type: "multiselect",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};
export function advanceSearchFilterPayment(advanceSearch) {
  if (!advanceSearch || Object.keys(advanceSearch).length === 0) return null;

  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(`b.mblNo = '${advanceSearch.blNo}'`);
  }

  if (advanceSearch.statusId && advanceSearch.statusId.length > 0) {
    const ids = advanceSearch.statusId.map((s) => s.Id).join(",");
    condition.push(`ipAgg.statusId IN (${ids})`);
  }

  return condition.length > 0 ? condition.join(" AND ") : null;
}
