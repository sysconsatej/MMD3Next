export const advanceSearchFields = {
  bl: [
    {
      label: "BL No./Via No-Cust Code",
      name: "mblNo",
      isEdit: true,
    },
    {
      label: "Payment Date (From)",
      name: "fromDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Payment Date (To)",
      name: "toDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Payment Mode",
      name: "paymentModeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    // {
    //   label: "Show All Requests",
    //   name: "showAllRequests",
    //   type: "checkbox",
    //   isEdit: true,
    // },
    // {
    //   label: "Show Snoozed Items",
    //   name: "showSnoozedItems",
    //   type: "checkbox",
    //   isEdit: true,
    // },
  ],
};
export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.mblNo) {
    condition.push(`b.mblNo LIKE '%${advanceSearch.mblNo}%'`);
  }

  if (advanceSearch.fromDate && advanceSearch.toDate) {
    condition.push(
      `p.createdDate BETWEEN '${advanceSearch.fromDate}' AND '${advanceSearch.toDate}'`
    );
  }

  if (advanceSearch.paymentTypeId) {
    condition.push(`p.paymentTypeId = ${advanceSearch.paymentTypeId.Id}`);
  }

  return condition.length > 0 ? condition.join(" AND ") : null;
}
