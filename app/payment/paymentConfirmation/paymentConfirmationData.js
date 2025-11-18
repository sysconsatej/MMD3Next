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
      name: "paymentModeId",         // 👈 keep this name
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentType'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Status",               // 👈 NEW
      name: "statusId",
      type: "multiselect",           // same type your AdvancedSearchBar expects
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblPaymentStatus'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  // BL No
  if (advanceSearch.mblNo) {
    condition.push(`b.mblNo LIKE '%${advanceSearch.mblNo}%'`);
  }

  // Date range
  if (advanceSearch.fromDate && advanceSearch.toDate) {
    condition.push(
      `p.createdDate BETWEEN '${advanceSearch.fromDate}' AND '${advanceSearch.toDate}'`
    );
  }

  // Payment mode filter (fix name -> paymentModeId)
  if (advanceSearch.paymentModeId) {
    condition.push(`p.paymentTypeId = ${advanceSearch.paymentModeId.Id}`);
  }

  // ✅ Status multiselect filter
  if (advanceSearch.statusId && advanceSearch.statusId.length > 0) {
    const ids = advanceSearch.statusId.map((s) => s.Id).join(",");
    condition.push(`p.paymentStatusId IN (${ids})`);
  }

  return condition.length > 0 ? condition.join(" AND ") : null;
}


export function paymentStatusColor(status) {
  const map = {
    "Payment Confirmation Requested": "#4E61D3", // Blue
    "Payment Confirmed": "green", // Green
    "Payment Rejected": "#DC0E0E", // Red
  };
  return map[status] || "inherit";
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

export const RejectModal = ({ rejectState, setRejectState, rejectHandler }) => {
  return (
    <Dialog
      open={rejectState.toggle}
      onClose={() => setRejectState((prev) => ({ ...prev, toggle: false }))}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Reject — Add Remarks</DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label="Remarks"
          value={rejectState.value}
          onChange={(e) =>
            setRejectState((prev) => ({ ...prev, value: e.target.value }))
          }
        />
      </DialogContent>

      <DialogActions>
        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={() => setRejectState((prev) => ({ ...prev, toggle: false }))}
        >
          Cancel
        </div>

        <div
          className="py-1 px-3 border border-[#B5C4F0] rounded-sm text-xs cursor-pointer hover:bg-[#B5C4F0] hover:text-white"
          onClick={rejectHandler}
        >
          Save
        </div>
      </DialogActions>
    </Dialog>
  );
};
