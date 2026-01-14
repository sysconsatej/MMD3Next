import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
