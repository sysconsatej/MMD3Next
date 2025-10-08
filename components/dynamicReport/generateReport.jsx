"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import CustomButton from "@/components/button/button";


export default function GenerateReportButton({
  buttonText = "Generate Report",
  reportOptions = ["Import General Manifest"],
  defaultMode = "Combined",
  onDownload,
  onPdf,
  onEmail,
}) {
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);

  const [mode, setMode] = useState(defaultMode);
  const [selected, setSelected] = useState([]);

  const allChecked = selected.length > 0 && selected.length === reportOptions.length;
  const canProceed = selected.length > 0;

  const toggleAll = () => setSelected(allChecked ? [] : reportOptions);
  const toggleOne = (name) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const ctx = useMemo(
    () => ({ mode, selectedReports: selected }),
    [mode, selected]
  );

  return (
    <>
      <CustomButton text={buttonText} onClick={() => setStep1Open(true)} />

      {/* STEP 1 */}
      <Dialog open={step1Open} onClose={() => setStep1Open(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reports</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel value="Combined" control={<Radio />} label="Combined" />
            <FormControlLabel value="Separate" control={<Radio />} label="Separate" />
          </RadioGroup>

          <Box className="flex flex-col gap-2 mt-2">
            <FormControlLabel
              control={<Checkbox checked={allChecked} onChange={toggleAll} />}
              label="Select All"
            />
            {reportOptions.map((name) => (
              <FormControlLabel
                key={name}
                control={
                  <Checkbox
                    checked={selected.includes(name)}
                    onChange={() => toggleOne(name)}
                  />
                }
                label={name}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton
            text="Print"
            onClick={() => {
              if (!canProceed) return;
              setStep1Open(false);
              setStep2Open(true);
            }}
            disabled={!canProceed}
          />
          <CustomButton text="Cancel" variant="outlined" onClick={() => setStep1Open(false)} />
        </DialogActions>
      </Dialog>

      {/* STEP 2 */}
      <Dialog open={step2Open} onClose={() => setStep2Open(false)} fullWidth maxWidth="xl">
        <DialogTitle>Output Options</DialogTitle>
        <DialogContent dividers>
          <Box className="flex gap-4">
            <CustomButton
              text="Download"
              onClick={() => {
                onDownload?.(ctx);
                setStep2Open(false);
              }}
            />
            <CustomButton
              text="PDF"
              onClick={() => {
                onPdf?.(ctx);
                setStep2Open(false);
              }}
            />
            <CustomButton
              text="Email"
              onClick={async () => {
                await onEmail?.(ctx);
                setStep2Open(false);
              }}
            />
          </Box>

          <Divider className="!my-4" />
          <Typography variant="body2">
            Mode: <b>{mode}</b><br />
            Reports: <b>{selected.join(", ") || "—"}</b>
          </Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton text="Back" variant="outlined" onClick={() => { setStep2Open(false); setStep1Open(true); }} />
          <CustomButton text="Close" onClick={() => setStep2Open(false)} />
        </DialogActions>
      </Dialog>
    </>
  );
}
