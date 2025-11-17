"use client";
import { useMemo, useState, useEffect } from "react";
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
import { formatDataWithForm, formatFetchForm, formatFormData } from "@/utils";
import { formStore } from "@/store";
import { getUserByCookies } from "@/utils";
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
  const [formData, setFormData] = useState({});
  const [fieldsMode, setFieldsMode] = useState("");
  const [jsonData] = useState(data);

  const { mode, setMode } = formStore();
  const [loading, setLoading] = useState(false);

  const [statusList, setStatusList] = useState([]);
  const [requestBtn, setRequestBtn] = useState(true);

  const [rejectState, setRejectState] = useState({
    toggle: false,
    value: null,
  });

  // USER DATA & ROLE
  const userData = getUserByCookies();
  const isLiner = userData?.roleCode === "shipping"; // only liner

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

  /* ------------------------ FETCH STATUS ------------------------ */
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

    try {
      setLoading(true);

      const normalized = {
        ...formData,
        isFreeDays: radioFD,
        isHighSealSale:
          formData?.isHighSealSale === true || formData?.isHighSealSale === "Y"
            ? "Y"
            : "N",
      };

      const payload = formatFormData(
        "tblInvoiceRequest",
        normalized,
        mode?.formId || undefined,
        "invoiceRequestId"
      );

      const { success, message, error } = await insertUpdateForm(payload);

      if (success) {
        toast.success(message || "Saved");
        setFormData({});
        setRequestBtn(false);
        setMode({ mode: "edit", formId: mode?.formId || normalized?.id });
      } else {
        toast.error(error || message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------ FETCH FORM ------------------------ */
  useEffect(() => {
    async function fetchFormHandler() {
      if (!mode.formId) return;

      setFieldsMode(mode.mode || "");

      const format = formatFetchForm(
        data,
        "tblInvoiceRequest",
        mode.formId,
        '["tblInvoiceRequestContainer","tblAttachement"]',
        "invoiceRequestId"
      );

      const { success, result } = await fetchForm(format);

      if (success) {
        const getData = formatDataWithForm(result, data);

        getData.isFreeDays = normalizeFD(getData?.isFreeDays);
        getData.isHighSealSale = getData?.isHighSealSale === "Y";

        setRequestBtn(false);
        setFormData(getData);
      }
    }

    fetchFormHandler();
  }, [mode.formId]);

  /* ------------------------ REQUEST ------------------------ */
  async function requestHandler() {
    const id = statusList.find((x) => x.Name === "Requested")?.Id;
    if (!id) return toast.error("Requested status missing");

    const payload = {
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: [{ id: mode.formId, invoiceRequestStatusId: id }],
    };

    const res = await updateStatusRows(payload);
    res?.success ? toast.success("Request sent") : toast.error(res?.message);
  }

  /* ------------------------ RELEASE ------------------------ */
  async function releaseHandler() {
    const id = statusList.find((x) => x.Name === "Released")?.Id;
    if (!id) return toast.error("Released status missing");

    const payload = {
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: [{ id: mode.formId, invoiceRequestStatusId: id }],
    };

    const res = await updateStatusRows(payload);
    res?.success ? toast.success("Released") : toast.error(res?.message);
  }

  /* ------------------------ REJECT ------------------------ */
  async function rejectHandler() {
    const id = statusList.find((x) => x.Name === "Rejected")?.Id;
    if (!id) return toast.error("Rejected status missing");

    const payload = {
      tableName: "tblInvoiceRequest",
      keyColumn: "id",
      rows: [
        {
          id: mode.formId,
          invoiceRequestStatusId: id,
          rejectRemarks: rejectState.value,
        },
      ],
    };

    const res = await updateStatusRows(payload);

    if (res?.success) {
      toast.success("Rejected");
      setRejectState({ toggle: false, value: null });
    } else toast.error(res?.message);
  }

  /* ------------------------ BUTTON LOGIC ------------------------ */

  const showRequestBtn = !isLiner && mode.formId;

  const showRejectBtn = isLiner;
  const showReleaseBtn = isLiner;

  /* ------------------------ RENDER ------------------------ */
  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={submitHandler}>
        <section className="py-2 px-4">
          <Box className="flex justify-between">
            <h1>Invoice Request</h1>

            <CustomButton
              text="Back"
              href="/request/invoiceRequest/list"
              onClick={() => setMode({ mode: null, formId: null })}
            />
          </Box>

          <FormHeading text="BL Information" />
          <Box className="grid grid-cols-3 gap-2 p-2">
            <CustomInput
              fields={igmFieldsToRender}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
            />
          </Box>

          <FormHeading text="Invoice In Name Of" />
          <Box className="grid grid-cols-4 gap-2 p-2">
            <CustomInput
              fields={jsonData.invoiceFields}
              formData={formData}
              setFormData={setFormData}
              fieldsMode={fieldsMode}
            />
          </Box>

          <Box
            className={`grid grid-cols-1 ${
              hideContainers ? "" : "lg:grid-cols-2"
            } gap-4`}
          >
            <Box>
              <FormHeading text="Attachment Details" />
              <TableGrid
                fields={jsonData.tblAttachement}
                formData={formData}
                setFormData={setFormData}
                fieldsMode={fieldsMode}
                gridName="tblAttachement"
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
            {/* Customer Save */}
            {fieldsMode !== "view" && !isLiner && (
              <CustomButton
                text={loading ? "Saving..." : "Submit"}
                type="submit"
                disabled={loading}
              />
            )}

            {/* Customer Request */}
            {showRequestBtn && (
              <CustomButton
                text="Request"
                onClick={requestHandler}
                disabled={requestBtn}
              />
            )}

            {/* Liner Release */}
            {showReleaseBtn && (
              <CustomButton text="Release" onClick={releaseHandler} />
            )}

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
