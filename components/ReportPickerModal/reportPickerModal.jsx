/* eslint-disable */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
    Backdrop, Modal, Fade, Box, Typography, Checkbox, FormControlLabel,
    Button, Divider, Paper, ToggleButtonGroup, ToggleButton,
} from "@mui/material";

export default function ReportPickerModal({
    open,
    onClose,
    availableReports,
    defaultSelectedKeys = [],
    initialMode = "combined",
    onGenerate,
    recordId,
    clientId,
    reportRoute = "/htmlReports/rptDoLetter",
}) {
    const [mode, setMode] = useState(initialMode);
    const [selected, setSelected] = useState(() => new Set(defaultSelectedKeys));

    useEffect(() => {
        if (open) {
            setMode(initialMode);
            setSelected(new Set(defaultSelectedKeys));
        }
    }, [open, initialMode, defaultSelectedKeys]);

    const allKeys = useMemo(() => (availableReports || []).map(r => r.key), [availableReports]);
    const allChecked = selected.size > 0 && selected.size === allKeys.length;
    const someChecked = selected.size > 0 && selected.size < allKeys.length;

    const toggleAll = (checked) => setSelected(checked ? new Set(allKeys) : new Set());
    const toggleOne = (key) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const handleGenerateMouseDown = (e) => {
        e.preventDefault();
        if (selected.size === 0) return;

        const ordered = (availableReports || []).map(r => r.key).filter(k => selected.has(k));
        const rid = encodeURIComponent(recordId ?? "");
        const cid = encodeURIComponent(clientId ?? "");
        if (!rid || !cid) { onClose?.(); return; }

        if (mode === "separate") {
            for (const name of ordered) {
                const url = `${reportRoute}?recordId=${rid}&clientId=${cid}&mode=combined&selected=${encodeURIComponent(name)}`;
                const w = window.open("", "_blank");
                if (w && !w.closed) {
                    try { w.opener = null; } catch { }
                    try { w.location.replace(url); } catch { w.location.href = url; }
                }
            }
        } else {
            const url = `${reportRoute}?recordId=${rid}&clientId=${cid}&mode=combined&selected=${encodeURIComponent(ordered.join("!"))}`;
            const w = window.open("", "_blank");
            if (w && !w.closed) {
                try { w.opener = null; } catch { }
                try { w.location.replace(url); } catch { w.location.href = url; }
            }
        }

        onGenerate?.({ selectedKeys: ordered, mode });
        onClose?.();
    };

    const disableGenerate = selected.size === 0 || !recordId || !clientId;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="report-picker-title"
            aria-describedby="report-picker-desc"
            closeAfterTransition
            disablePortal={false}
            keepMounted
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 180,
                    sx: (theme) => ({
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(10, 15, 25, 0.35)",
                        WebkitBackdropFilter: "blur(6px)",
                        backdropFilter: "blur(6px)",
                        zIndex: theme.zIndex.modal,
                    }),
                },
            }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: "fixed", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    p: 2, outline: "none", isolation: "isolate",
                    zIndex: (t) => t.zIndex.modal + 1,
                }}>
                    <Paper elevation={8} sx={(t) => ({
                        width: { xs: "100%", sm: 520 }, maxWidth: "96vw",
                        borderRadius: 2, p: 2.5, position: "relative",
                        zIndex: t.zIndex.modal + 2, backgroundColor: t.palette.background.paper,
                    })}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography id="report-picker-title" sx={{ fontWeight: 700, fontSize: 16 }}>
                                Reports
                            </Typography>
                            <ToggleButtonGroup
                                size="small"
                                value={mode}
                                exclusive
                                onChange={(_e, val) => val && setMode(val)}
                                aria-label="Report mode"
                            >
                                <ToggleButton value="combined">Combined</ToggleButton>
                                <ToggleButton value="separate">Separate</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        <FormControlLabel
                            sx={{ mb: 0.5, "& .MuiFormControlLabel-label": { fontSize: 12 } }}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={allChecked}
                                    indeterminate={someChecked}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                />
                            }
                            label="Select All"
                        />

                        <Box role="group" aria-label="Report list" sx={{
                            mt: 1, mb: 2, maxHeight: 280, overflowY: "auto", pr: 0.5,
                            display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 0.5,
                        }}>
                            {(availableReports || []).map((r) => (
                                <FormControlLabel
                                    key={r.key}
                                    sx={{
                                        m: 0, px: 0.5, borderRadius: 1,
                                        "& .MuiFormControlLabel-label": { fontSize: 12 },
                                        "&:hover": { backgroundColor: "action.hover" },
                                    }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={selected.has(r.key)}
                                            onChange={() => toggleOne(r.key)}
                                        />
                                    }
                                    label={r.label || r.key}
                                />
                            ))}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onMouseDown={handleGenerateMouseDown}
                                disabled={disableGenerate}
                            >
                                Generate
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Fade>
        </Modal>
    );
}

ReportPickerModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    availableReports: PropTypes.arrayOf(
        PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string })
    ).isRequired,
    defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
    initialMode: PropTypes.oneOf(["combined", "separate"]),
    onGenerate: PropTypes.func,
    recordId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reportRoute: PropTypes.string,
};
