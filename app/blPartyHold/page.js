"use client";

import { useMemo, useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import DynamicReportTable from "@/components/dynamicReport/dynamicReportEditable";
import { execSp } from "@/apis";
import { useRouter } from "next/navigation";
import fieldData from "./holdData";

export default function BLPartyHold() {
    const [formData, setFormData] = useState({});
    const [fieldsMode] = useState("");
    const [tableData, setTableData] = useState([]);
    const [tableFormData, setTableFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const router = useRouter();

    const trimOrNull = (v) => {
        const s = (v ?? "").toString().trim();
        return s ? s : null;
    };

    // ---- helpers: make dropdown mapping robust ----
    // Prefer human-readable fields first, and recurse if nested (e.g., {value: {id:.., name:'Hold'}, label:'Hold'})
    const prim = (v) => {
        if (Array.isArray(v)) return prim(v[0]);
        if (v && typeof v === "object") {
            // prefer label/name over value so 'Hold'/'Unhold' wins even if value=306/307
            let cand =
                v.label ?? v.name ?? v.Name ?? v.code ?? v.text ?? v.title ?? v.value ?? v.Id ?? v.id;
            if (cand && typeof cand === "object") return prim(cand);
            return cand ?? "";
        }
        return v;
    };

    const toUiStatus = (val) => {
        const s = String(prim(val) ?? "").trim().toUpperCase();
        if (["1", "H", "HOLD", "YES", "Y", "TRUE"].includes(s)) return "Hold";
        if (["0", "U", "UNHOLD", "NO", "N", "FALSE"].includes(s)) return "Unhold";
        return "";
    };

    const toDb01 = (val) => {
        const s = String(prim(val) ?? "").trim().toUpperCase();
        if (["1", "H", "HOLD", "YES", "Y", "TRUE"].includes(s)) return 1;
        if (["0", "U", "UNHOLD", "NO", "N", "FALSE"].includes(s)) return 0;
        return null;
    };

    const podFromLocation = (loc) => {
        const parts = String(loc || "")
            .split(">")
            .map((t) => t.trim())
            .filter(Boolean);
        if (parts.length >= 2) return parts[1];
        return parts[0] || "";
    };

    const extractConsigneeIdNo = (r) => {
        if (!r || typeof r !== "object") return "";
        const flat =
            r.consigneeIdNo ??
            r.consigneeIDNo ??
            r.consigneeId ??
            r.consigneeNo ??
            r.consigneeCode ??
            r.idNo ??
            r.idno ??
            r.panIec ??
            r.panIEC ??
            r.panNo ??
            r.PAN ??
            r.pan ??
            r.iecNo ??
            r.IEC ??
            r.iec ??
            r.taxId ??
            r.gstin;
        if (flat) return String(flat).trim();
        const c = r.consignee || r.party || r.customer || r.client || r.account || {};
        const nested =
            c.consigneeIdNo ?? c.idNo ?? c.panIec ?? c.panNo ?? c.iecNo ?? c.code ?? c.taxId ?? c.gstin;
        if (nested) return String(nested).trim();
        return "";
    };

    const holdFieldsLocal = useMemo(
        () => (Array.isArray(fieldData?.holdFields) ? fieldData.holdFields : []),
        []
    );

    const tableMetaLocal = useMemo(() => {
        const meta = (fieldData?.tableMeta || []).map((col) => {
            const base = { ...col };
            if (!base.fieldname && base.name) base.fieldname = base.name;
            if (!base.name && base.fieldname) base.name = base.fieldname;
            return base;
        });

        const norm = (s) => String(s ?? "").replace(/[\s_.-]+/g, "").toLowerCase();

        let hasConsigneeCol = false;
        for (let i = 0; i < meta.length; i++) {
            const m = meta[i];
            const nName = norm(m?.name);
            const nField = norm(m?.fieldname);
            const nLabel = norm(m?.label);
            const looksLikeConsigneeId =
                (nLabel.includes("consignee") && nLabel.includes("id")) ||
                (nName.includes("consignee") && nName.includes("id")) ||
                (nField.includes("consignee") && nField.includes("id")) ||
                nLabel.includes("pan") ||
                nLabel.includes("iec");
            if (looksLikeConsigneeId) {
                hasConsigneeCol = true;
                meta[i] = {
                    ...m,
                    name: "consigneeIdNo",
                    fieldname: "consigneeIdNo",
                    label: m.label || "Consignee Id No",
                };
            }
        }
        if (!hasConsigneeCol) {
            meta.push({
                name: "consigneeIdNo",
                fieldname: "consigneeIdNo",
                label: "Consignee Id No",
            });
        }

        for (let i = 0; i < meta.length; i++) {
            const m = meta[i];
            const nName = norm(m?.name);
            const nField = norm(m?.fieldname);
            const nLabel = norm(m?.label);
            const looksLikePod =
                nLabel === "pod" ||
                nLabel.includes("portofdischarge") ||
                nName === "pod" ||
                nField === "pod" ||
                nName === "podtext" ||
                nField === "podtext";
            if (looksLikePod) {
                meta[i] = { ...m, name: "podText", fieldname: "podText", label: "Location" };
            }
        }

        return meta;
    }, [fieldData?.tableMeta]);

    const normalizeRows = (rows = [], fallbackConsigneeId = "") =>
        rows.map((r, i) => {
            const extracted = extractConsigneeIdNo(r);
            const consigneeIdNo =
                extracted || r.consigneeIdNo || r.idNo || r.panNo || r.iecNo || fallbackConsigneeId || "";
            const podText = r.podText || podFromLocation(r.location) || "";
            return {
                __sr: i + 1,
                id: r.id,
                partyName: r.partyName ?? r.consigneeText ?? "",
                consigneeIdNo,
                blNo: r.blNo ?? r.hblNo ?? r.mblNo ?? "",
                podText,
                holdRemarks: r.holdRemarks ?? "",
                holdStatus: toUiStatus(r.holdStatus), // UI shows "Hold"/"Unhold"
            };
        });

    // GO (fetch)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const blNo = trimOrNull(formData?.blNo);
        const partyName = trimOrNull(formData?.consigneeText);
        const idNo = trimOrNull(formData?.consigneeIdNo);

        let payload = {};
        if (blNo) payload = { blNo };
        else if (partyName) payload = { partyName, consigneeText: partyName };
        else if (idNo) payload = { idNo, consigneeIdNo: idNo };

        if (!Object.keys(payload).length) {
            setLoading(false);
            toast.error("Enter at least one filter (BL No / Party / PAN-IEC).");
            return;
        }

        try {
            const res = await execSp({
                spName: "getBlPartyHoldDetails",
                jsonData: payload,
                paramName: "filterCondition",
            });
            if (res.success) {
                const rows = Array.isArray(res.data) ? res.data : [];
                const formFallback = trimOrNull(formData?.consigneeIdNo) || "";
                const payloadFallback = rows.length ? extractConsigneeIdNo(rows[0]) : "";
                const fallbackConsigneeId = formFallback || payloadFallback;
                setTableData(normalizeRows(rows, fallbackConsigneeId));
                if (!rows.length) toast.info("No data found.");
            } else {
                setTableData([]);
                toast.error(res.error || res.message || "Request failed.");
            }
        } catch (err) {
            setTableData([]);
            toast.error(String(err?.message || "Network/Server error."));
        } finally {
            setLoading(false);
        }
    };

    // UPDATE (write changes)
    const handleUpdate = async () => {
        if (!Array.isArray(tableFormData) || tableFormData.length === 0) {
            toast.info("Select & edit at least one row.");
            return;
        }

        const cleaned = tableFormData
            .map((r) => {
                const id = Number(r.id);
                if (!Number.isFinite(id)) return null;

                // if user didn't touch Status in this edit, fallback to the current grid value
                const full = tableData.find((x) => Number(x.id) === id) || {};
                const chosenStatus = r.holdStatus ?? full.holdStatus; // could be object or string
                return {
                    id,
                    holdStatus: toDb01(chosenStatus), // -> 1/0/null
                    holdRemarks: trimOrNull(r.holdRemarks),
                };
            })
            .filter(Boolean);

        if (!cleaned.length) {
            toast.info("No valid changes found.");
            return;
        }

        setLoadingUpdate(true);
        try {
            const res = await execSp({
                spName: "updateBlPartyHold",
                jsonData: { data: cleaned },
                paramName: "json",
            });
            if (res.success) {
                toast.success(res.message || "Hold/Unhold updated.");
                const map = new Map(cleaned.map((r) => [r.id, r]));
                setTableData((prev) =>
                    prev.map((row) =>
                        map.has(row.id)
                            ? {
                                ...row,
                                holdStatus: toUiStatus(map.get(row.id).holdStatus),
                                holdRemarks: map.get(row.id).holdRemarks ?? row.holdRemarks ?? "",
                            }
                            : row
                    )
                );
                setTableFormData([]);
            } else {
                toast.error(res.error || res.message || "Update failed.");
            }
        } catch (err) {
            toast.error(String(err?.message || "Network/Server error."));
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <style jsx global>{`
        .drt-wrap table { table-layout: fixed !important; width: 100%; }
        .drt-wrap th, .drt-wrap td {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
        }
        .drt-wrap td .MuiInputBase-root,
        .drt-wrap td .MuiSelect-select,
        .drt-wrap td .MuiInputBase-input,
        .drt-wrap td textarea,
        .drt-wrap td input {
          width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; line-height: 1.12;
        }
        .drt-wrap td .MuiSelect-select { padding-right: 28px !important; min-width: 0 !important; }
        .drt-wrap td textarea { resize: vertical !important; max-height: 72px; min-height: 32px; padding: 6px 8px; }
        .MuiPopover-root, .MuiMenu-root, .MuiModal-root { z-index: 20000 !important; }
        .drt-wrap td, .drt-wrap th { color: #111; }
      `}</style>

            <form onSubmit={handleSubmit}>
                <section className="py-1 px-4">
                    <Box className="flex justify-between items-end py-1">
                        <h1 className="text-left text-base flex items-end m-0">BL Hold</h1>
                    </Box>

                    <Box className="border border-solid border-black rounded-[4px]">
                        <Box className="sm:grid sm:grid-cols-4 gap-2 flex flex-col p-1 border-b border-b-solid border-b-black">
                            <CustomInput
                                fields={holdFieldsLocal}
                                formData={formData}
                                setFormData={setFormData}
                                fieldsMode={fieldsMode}
                            />
                        </Box>
                    </Box>

                    <Box className="w-full flex mt-2 gap-2">
                        <CustomButton text={loading ? "Loading..." : "GO"} type="submit" disabled={loading} />
                        <CustomButton
                            text={loadingUpdate ? "Updating..." : "Update Hold/Remark"}
                            type="button"
                            onClick={handleUpdate}
                            disabled={loadingUpdate}
                        />
                        <CustomButton
                            text="Cancel"
                            buttonStyles="!text-[white] !bg-[#f5554a] !text-[11px]"
                            onClick={() => router.push("/home")}
                            type="button"
                        />
                    </Box>
                </section>
            </form>

            <Box className="p-0 drt-wrap mx-auto" style={{ maxWidth: "fit-content", minWidth: "800px" }}>
                <DynamicReportTable
                    data={tableData}
                    metaData={tableMetaLocal}
                    onSelectedEditedChange={setTableFormData}
                    showTotalsRow={false}
                    showSrNo={true}
                    srNoSortable={true}
                />
            </Box>

            <ToastContainer />
        </ThemeProvider>
    );
}
