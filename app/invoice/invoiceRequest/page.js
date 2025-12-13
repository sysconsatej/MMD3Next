"use client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ThemeProvider, Box } from "@mui/material";
import data, { cfsGridButtons } from "./invoiceRequestData";
import { CustomInput } from "@/components/customInput";
import { theme } from "@/styles";
import { toast, ToastContainer } from "react-toastify";
import CustomButton from "@/components/button/button";
import FormHeading from "@/components/formHeading/formHeading";
import TableGrid from "@/components/tableGrid/tableGrid";
import {
  fetchForm,
  insertUpdateForm,
  getDataWithCondition,
  updateStatusRows,
} from "@/apis";
import {
  formatDataWithForm,
  formatFetchForm,
  formatFormData,
  getUserByCookies,
} from "@/utils";
import { formStore, useBackLinksStore, useBlWorkFlowData } from "@/store";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

/* ------------------------ Reject Modal ------------------------ */
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

export default function InvoiceRequest() {
  const [formData, setFormData] = useState({ isFreeDays: "F" });
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData] = useState(data);

  const { mode, setMode } = formStore();
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState({});

  const [statusList, setStatusList] = useState([]);

  // separate flags
  const [canSubmit, setCanSubmit] = useState(true); // controls Submit
  const [canRequest, setCanRequest] = useState(false); // controls Request

  const [rejectState, setRejectState] = useState({
    toggle: false,
    value: null,
  });

  const userData = getUserByCookies();
  const isLiner = userData?.roleCode === "shipping"; // liner vs customer
  const { link } = useBackLinksStore();
  const  { setClearData  } = useBlWorkFlowData();

  /* ------------------------ FREE DAYS ------------------------ */
  const normalizeFD = (v) => {
    if (v === "F" || v === "D") return v;
    if (v === true || v === "Y") return "F";
    if (v === false || v === "N") return "D";
    return "F";
  };

  const radioFD = useMemo(
    () => normalizeFD(formData?.isFreeDays),
    [formData?.isFreeDays]
  );

  const hideContainers = radioFD === "F";

  const igmFieldsToRender = useMemo(() => {
    const fields = Array.isArray(jsonData?.igmFields) ? jsonData.igmFields : [];
    return radioFD === "D"
      ? fields.filter((f) => f?.name !== "validTill")
      : fields;
  }, [jsonData?.igmFields, radioFD]);

  /* ------------------------ FETCH STATUS LIST ------------------------ */
  useEffect(() => {
    async function fetchStatus() {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: "masterListName = 'tblInvoiceRequest' AND status = 1",
      };

      const { success, data } = await getDataWithCondition(obj);
      if (success) setStatusList(data);
    }
    fetchStatus();
  }, []);

  /* ------------------------ SUBMIT ------------------------ */
  const submitHandler = async (e) => {
    e.preventDefault();

    // 🔴 VALIDATE ATTACHMENT UPLOAD (required on Add & Edit)
    const attachments = Array.isArray(formData?.tblAttachment)
      ? formData.tblAttachment
      : [];

    let hasAnyRow = false;

    for (const att of attachments) {
      const obj = att || {};
      const values = Object.values(obj).map((v) =>
        v === null || v === undefined ? "" : String(v).trim()
      );

      const anyValue = values.some((v) => v !== "");
      if (!anyValue) continue; // completely blank row -> ignore

      hasAnyRow = true;

      const hasPath =
        obj.path !== undefined &&
        obj.path !== null &&
        String(obj.path).trim() !== "";

      if (!hasPath) {
        toast.error("Upload is required for all attachment rows.");
        return;
      }
    }

    if (!hasAnyRow) {
      toast.error("Please add and upload at least one attachment.");
      return;
    }

    try {
      setLoading(true);

      const normalized = {
        ...formData,
        companyId: userData?.companyId,
        companyBranchId: userData?.branchId,
        isFreeDays: radioFD,
        isHighSealSale:
          formData?.isHighSealSale === true || formData?.isHighSealSale === "Y"
            ? "Y"
            : "N",
        locationId: userData?.location || null,    
      };

      const payload = formatFormData(
        "tblInvoiceRequest",
        normalized,
        mode?.formId || undefined,
        "invoiceRequestId"
      );

      const res = await insertUpdateForm(payload);
      const { success, message, error } = res || {};

      if (success) {
        // ✅ SAME BEHAVIOUR FOR ADD & EDIT:
        // after first save → disable Submit, enable Request
        setCanSubmit(false);
        setCanRequest(true);

        if (mode?.formId) {
          toast.success(message || "Form updated successfully!");
        } else {
          toast.success(message || "Form submit successfully!");
        }
      } else {
        toast.error(error || message || "Error while saving");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------ BL → FETCH CONTAINERS ------------------------ */
  // uses mblNo in tblBl, blNo in this screen
  const loadBlContainers = useCallback(
    async (normalizedBlNo) => {
      if (!normalizedBlNo) return;

      const literal = normalizedBlNo.replace(/'/g, "''");

      // find BL by MBL No
      const blObj = {
        columns: "b.id",
        tableName: "tblBl b",
        whereCondition: `isnull(hblNo,mblNo) = '${literal}' AND ISNULL(status,1)=1`,
      };

      const {
        data: blRows,
        success: blSuccess,
        message: blMsg,
        error: blErr,
      } = await getDataWithCondition(blObj);

      if (!blSuccess || !Array.isArray(blRows) || blRows.length === 0) {
        // 🔕 no toast in view mode
        if (fieldsMode !== "view") {
          toast.warn("BL not found.");
        }
        console.error("BL lookup error:", blErr || blMsg);
        return;
      }

      const blId = blRows[0].id;

      // fetch all containers for this BL
      const contObj = {
        columns:
          "c.containerNo, c.sizeId, (SELECT name FROM tblMasterData m WHERE m.id = c.sizeId) AS sizeName",
        tableName: "tblBlContainer c",
        whereCondition: `c.blId = ${blId} AND ISNULL(c.status,1) = 1`,
      };

      const {
        data: contRows,
        success: contSuccess,
        message: contMsg,
        error: contErr,
      } = await getDataWithCondition(contObj);

      if (!contSuccess) {
        if (fieldsMode !== "view") {
          toast.error(contErr || contMsg || "Failed to fetch BL containers.");
        }
        console.error("Container fetch error:", contErr || contMsg);
        return;
      }

      const containers = (contRows || []).map((row) => ({
        containerNo: row.containerNo,
        sizeId: row.sizeId
          ? { Id: row.sizeId, Name: row.sizeName || String(row.sizeId) }
          : null,
        // validTill left empty
      }));

      setFormData((prev) => ({
        ...prev,
        tblInvoiceRequestContainer: containers,
      }));
    },
    [fieldsMode]
  );

  /* ✅ auto-load containers when radio changes to "Do Extension" (D)
     and BL No is already entered */
  const prevRadioRef = useRef(radioFD);
  useEffect(() => {
    const prev = prevRadioRef.current;
    prevRadioRef.current = radioFD;

    // don't auto-load in view mode
    if (fieldsMode === "view") return;

    if (radioFD === "D" && prev !== "D") {
      const currentBl = (formData?.blNo || "").trim();
      if (currentBl) {
        loadBlContainers(currentBl);
      }
    }
  }, [radioFD, formData?.blNo, loadBlContainers, fieldsMode]);

  /* ------------------------ BLUR HANDLERS ------------------------ */
  const handleBlurEventFunctions = {
    duplicateHandler: async (event) => {
      const { name, value } = event.target;
      const normalized = String(value ?? "").trim();
      if (!normalized) return true;

      const literal = normalized.replace(/'/g, "''");
      // Duplicate check â€“ ignore same record when editing
      let whereDup = `blNo = '${literal}' AND status = 1 and companyId='${userData.companyId}'`;
      if (mode?.formId) {
        whereDup += ` AND id <> ${mode.formId}`;
      }

      const obj = {
        columns: "id",
        tableName: "tblInvoiceRequest",
        whereCondition: whereDup,
      };

      const resp = await getDataWithCondition(obj);

      const isDuplicate =
        resp?.success && Array.isArray(resp?.data) && resp.data.length > 0;

      if (isDuplicate) {
        setErrorState((prev) => ({ ...prev, [name]: true }));
        setFormData((prev) => ({ ...prev, [name]: "" }));
        toast.error(`Invoice Request already exists for BL No ${normalized}.`);
        return false;
      }

      // Not duplicate → store value
      setFormData((prev) => ({ ...prev, [name]: normalized }));
      setErrorState((prev) => ({ ...prev, [name]: false }));

      // fetch containers only when radio is "Do Extension"
      if (radioFD === "D" && fieldsMode !== "view") {
        try {
          await loadBlContainers(normalized);
        } catch (e) {
          console.error("Error loading containers:", e);
          toast.error("Error loading containers for this BL.");
        }
      }

      return true;
    },
  };

  /* ------------------------ FETCH FORM (EDIT/VIEW) ------------------------ */
  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode.formId) return;

      setFieldsMode(mode.mode || "");

      const format = formatFetchForm(
        data,
        "tblInvoiceRequest",
        mode.formId,
        '["tblInvoiceRequestContainer","tblAttachment"]',
        "invoiceRequestId"
      );

      const { success, result, message, error } = await fetchForm(format);

      if (success) {
        const getData = formatDataWithForm(result, data);

        getData.isFreeDays = normalizeFD(getData?.isFreeDays);
        getData.isHighSealSale = getData?.isHighSealSale === "Y";

        setFormData(getData);

        // 🔵 Get current status name from DB for this record
        let currentStatusName = "";
        try {
          const statusQuery = {
            columns: "m.name AS StatusName",
            tableName: "tblInvoiceRequest i",
            joins:
              "LEFT JOIN tblMasterData m ON m.id = i.invoiceRequestStatusId",
            whereCondition: `i.id = ${mode.formId}`,
          };

          const { success: stSuccess, data: stData } =
            await getDataWithCondition(statusQuery);

          if (stSuccess && Array.isArray(stData) && stData.length > 0) {
            currentStatusName = String(stData[0].StatusName || "")
              .toLowerCase()
              .trim();
          }
        } catch (e) {
          console.error("Error fetching current status:", e);
        }

        // ✅ Behaviour:
        // - ADD / EDIT → Submit enabled, Request disabled
        // - VIEW (customer):
        //     if status NOT Requested / Released → Request enabled
        //     else → Request disabled
        if (mode.mode === "view" && userData?.roleCode === "customer") {
          setCanSubmit(false);
          if (
            currentStatusName !== "requested" &&
            currentStatusName !== "released"
          ) {
            setCanRequest(true);
          } else {
            setCanRequest(false);
          }
        } else {
          setCanSubmit(true);
          setCanRequest(false);
        }
      } else {
        toast.error(error || message || "Failed to fetch form");
      }
    }

    fetchFormHandler();
  }, [mode.formId, mode.mode, userData?.roleCode]);

  /* ------------------------ REQUEST (Customer) ------------------------ */
  async function requestHandler() {
    const requestStatusId = statusList.find((x) => x.Name === "Requested")?.Id;
    if (!requestStatusId) {
      toast.error("Requested status missing in master");
      return;
    }
    if (!formData?.blNo) {
      toast.error("BL No is required before sending Request");
      return;
    }

    const obj = {
      columns: "id",
      tableName: "tblInvoiceRequest",
      whereCondition: `blNo = '${formData.blNo}' and status = 1 and companyId='${userData.companyId}'`,
    };

    const { data, success, message, error } = await getDataWithCondition(obj);
    if (!success || !Array.isArray(data) || data.length === 0) {
      toast.error(
        message ||
          error ||
          "Invoice Request record not found. Please save first."
      );
      return;
    }

    const rowsPayload = data.map((row) => ({
      id: row.id,
      invoiceRequestStatusId: requestStatusId,
      updatedBy: userData.userId,
      updatedDate: new Date(),
    }));
    const res = await updateStatusRows({
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: rowsPayload,
    });

    if (res?.success) {
      toast.success("Request updated successfully!");
      // after Request → disable Request button
      setCanRequest(false);
      setMode((prev) => ({ ...prev, status: "Requested" }));
    } else {
      toast.error(res?.message || "Error executing request update");
    }
  }

  /* ------------------------ RELEASE (Liner) ------------------------ */
  async function releaseHandler() {
    const releasedStatusId = statusList.find((x) => x.Name === "Released")?.Id;
    if (!releasedStatusId) return toast.error("Released status missing");

    const payload = {
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: [{ id: mode.formId, invoiceRequestStatusId: releasedStatusId }],
    };

    const res = await updateStatusRows(payload);
    if (res?.success) {
      toast.success("Released");
      setMode((prev) => ({ ...prev, status: "Released" }));
    } else {
      toast.error(res?.message || "Error while releasing");
    }
  }

  /* ------------------------ REJECT (Liner) ------------------------ */
  async function rejectHandler() {
    const rejectedStatusId = statusList.find((x) => x.Name === "Rejected")?.Id;
    if (!rejectedStatusId) return toast.error("Rejected status missing");

    const payload = {
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: [
        {
          id: mode.formId,
          invoiceRequestStatusId: rejectedStatusId,
          rejectRemarks: rejectState.value,
          updatedBy: userData.userId,
          updatedDate: new Date(),
        },
      ],
    };

    const res = await updateStatusRows(payload);

    if (res?.success) {
      toast.success("Rejected");
      setRejectState({ toggle: false, value: null });
      // when Rejected → customer can Request again on next open
      setMode((prev) => ({ ...prev, status: "Rejected" }));
      setCanRequest(true);
    } else {
      toast.error(res?.message || "Error while rejecting");
    }
  }

  const showRejectBtn = isLiner;
  const showReleaseBtn = isLiner;

  const handleClearData = () => {
    setMode({ mode: null, formId: null });
    setClearData([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between">
            <h1>Invoice Request</h1>

            {userData?.roleCode === "customer" && (
              <CustomButton
                text="Back"
                href={link ? link?.blStatus : "/invoice/invoiceRequest/list"}
                onClick={handleClearData}
              />
            )}

            {userData?.roleCode === "shipping" && (
              <CustomButton
                text="Back"
                href={link ? link?.blStatus : "/invoice/invoiceRelease/list"}
                onClick={handleClearData}
              />
            )}
          </Box>

          {/* BL Info */}
          <FormHeading text="BL Information" />
          <Box className="grid grid-cols-3 gap-2 p-2">
            <CustomInput
              fields={igmFieldsToRender}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
              handleBlurEventFunctions={handleBlurEventFunctions}
              errorState={errorState}
            />
          </Box>

          {/* Invoice In Name Of */}
          <FormHeading text="Invoice In Name Of" />
          <Box className="grid grid-cols-4 gap-2 p-2">
            <CustomInput
              fields={jsonData.invoiceFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
            />
          </Box>

          {/* Attachment + Containers */}
          <Box
            className={`grid grid-cols-1 ${
              hideContainers ? "" : "lg:grid-cols-2"
            } gap-4`}
          >
            <Box>
              <FormHeading text="Attachment Details" />
              <TableGrid
                fields={jsonData.tblAttachment}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblAttachment"
                buttons={cfsGridButtons}
              />
            </Box>

            {!hideContainers && (
              <Box>
                <FormHeading text="Container Details" />
                <TableGrid
                  fields={jsonData.tblInvoiceRequestContainer}
                  formData={formData}
                  setFormData={setFormData}
                  fieldsMode={fieldsMode}
                  gridName="tblInvoiceRequestContainer"
                  buttons={cfsGridButtons}
                />
              </Box>
            )}
          </Box>

          {/* -------- BUTTONS -------- */}
          <Box className="w-full flex mt-4 gap-3">
            {/* Submit */}
            {fieldsMode !== "view" &&
              userData?.roleCode === "customer" &&
              mode.status !== "Confirm" && (
                <CustomButton
                  text={loading ? "Saving..." : "Submit"}
                  type="submit"
                  disabled={!canSubmit || loading}
                />
              )}

            {/* Request */}
            {userData?.roleCode === "customer" && mode.status !== "Confirm" && (
              <CustomButton
                text="Request"
                onClick={requestHandler}
                disabled={!canRequest || loading}
              />
            )}

            {/* Liner Release */}
            {/* {showReleaseBtn && (
              <CustomButton text="Release" onClick={releaseHandler} />
            )} */}

            {/* Liner Reject */}
            {showRejectBtn && (
              <CustomButton
                text="Reject"
                onClick={() =>
                  setRejectState((prev) => ({ ...prev, toggle: true }))
                }
              />
            )}
          </Box>
        </section>
      </form>

      <ToastContainer />

      <RejectModal
        rejectState={rejectState}
        setRejectState={setRejectState}
        rejectHandler={rejectHandler}
      />
    </ThemeProvider>
  );
}
