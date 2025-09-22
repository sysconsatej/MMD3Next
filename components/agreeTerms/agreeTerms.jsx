"use client";
import { useState } from "react";
import {
  Box,
  Checkbox,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function AgreeTerms() {
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box className="flex flex-col mt-2">
      <Box display="flex" alignItems="center" gap={1}>
        <Checkbox checked={checked} onChange={handleChange} color="primary" />
        <Typography variant="body2" className="text-gray-700">
          I agree to the{" "}
          <Link href="#" underline="hover" onClick={handleOpen}>
            Terms & Conditions
          </Link>
        </Typography>

        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          style={{ display: "none" }}
          required
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          Terms & Conditions
          <IconButton onClick={handleClose}>
            <CloseIcon sx={{ color: "red", fontSize: 28 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            variant="body2"
            className="text-gray-700 whitespace-pre-line">
            {`We, submitting the data, do hereby undertake and agree to indemnify fully against all consequences and/or liabilities of any kind whatsoever directly and/or indirectly arising
from or relating to the above mentioned amendment & split and immediately on demand against all payments made by you in respect of such consequences and/or liabilities,
including costs between solicitor and client and all/or any sums demanded by you for defense of any proceedings brought against you by reason of the amendment & split aforesaid.
Further we shall not hold you responsible for any custom amendment for above stated filing.`}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
