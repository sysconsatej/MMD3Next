import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const data = {
  blFields: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
      required: true,
      blurFun: "fetchBlDetails",
    },
    {
      label: "Payor Name",
      name: "payorName",
      type: "dropdown",
      tableName: "tblUser c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblUser",
      required: true,
      disabled: true, // ✅ correct key
    },
  ],

  // ✅ ONLY Receipt No + Receipt Date (NO Payment here)
  receiptFieldsTop: [
    {
      label: "Receipt No",
      name: "receiptNo",
      isEdit: true,
      required: true,
    },
    {
      label: "Receipt Date",
      name: "receiptDate",
      type: "date",
      isEdit: true,
      required: true,
    },
    {
      label: "Payment",
      name: "Amount",
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
      where: "m.masterListName = 'tblPaymentType' and m.name ='Receipt'",
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

export const receiptGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];

export default data;
export const advanceSearchFields = {
  bl: [
    {
      label: "Receipt No",
      name: "receiptNo",
      isEdit: true,
    },
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Payor Name",
      name: "payorName",
      isEdit: true,
    },
  ],
};
export function advanceSearchFilter(adv) {
  if (!adv || Object.keys(adv).length === 0) return null;

  const condition = [];

  // Receipt No (comma separated)
  if (adv.receiptNo) {
    const parts = adv.receiptNo
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (parts.length > 0) {
      const likeParts = parts
        .map((x) => `p.receiptNo LIKE '%${x}%'`)
        .join(" OR ");

      condition.push(`(${likeParts})`);
    }
  }

  // BL No
  if (adv.blNo) {
    condition.push(
      `(b.mblNo LIKE '%${adv.blNo}%' OR b.hblNo LIKE '%${adv.blNo}%')`
    );
  }

  // Payor Name
  if (adv.payorName) {
    condition.push(`u1.name LIKE '%${adv.payorName}%'`);
  }

  return condition.length ? condition.join(" AND ") : null;
}
