import { fetchForm, getDataWithCondition, updateStatusRows } from "@/apis";
import { formatDataWithForm, formatFetchForm, getUserByCookies } from "@/utils";
import { toast } from "react-toastify";

export const doStatusHandler = (getData, router, setMode) => {
  const userData = getUserByCookies();

  return {
    handleView: (id, status) => {
      setMode({ mode: "view", formId: id?.[0], status: status });
      router.push("/invoice/doRequest");
    },
    handleEdit: (id, status) => {
      setMode({ mode: "edit", formId: id?.[0], status: status });
      router.push("/invoice/doRequest");
    },
    handleViewBL: async (ids) => {
      const id = ids[0];
      const obj = {
        columns: "b.id id, b.mblHblFlag mblHblFlag",
        tableName: "tblDoRequest d",
        joins: `
          left join tblBl b on b.id = d.blId  and b.status = 1
        `,
        whereCondition: `d.id = ${id} and d.status = 1`,
      };
      const { data, success, error } = await getDataWithCondition(obj);
      if (data?.length > 0 && success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "view", formId: `${data?.[0]?.id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "view", formId: data?.[0]?.id });
          router.push("/bl/mbl");
        }
      } else {
        console.log("error", error);
        toast.error(error);
      }
    },
    handleEditBL: async (ids) => {
      const id = ids[0];
      const obj = {
        columns: "b.id id, b.mblHblFlag mblHblFlag",
        tableName: "tblDoRequest d",
        joins: `
          left join tblBl b on b.id = d.blId  and b.status = 1
        `,
        whereCondition: `d.id = ${id} and d.status = 1`,
      };
      const { data, success, error } = await getDataWithCondition(obj);
      if (data?.length > 0 && success) {
        if (data?.[0]?.mblHblFlag === "HBL") {
          setMode({ mode: "edit", formId: `${data?.[0]?.id}` });
          router.push("/bl/hbl");
        } else {
          setMode({ mode: "edit", formId: data?.[0]?.id });
          router.push("/bl/mbl");
        }
      } else {
        console.log("error", error);
        toast.error(error);
      }
    },
    handleRequestDO: async (ids) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Request for DO'`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        const rowsPayload = ids?.map((id) => {
          return {
            id: id,
            doRequestStatusId: data?.[0]?.Id,
            doRejectRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

        const res = await updateStatusRows({
          tableName: "tblDoRequest",
          rows: rowsPayload,
          keyColumn: "id",
        });
        const { success, message } = res || {};
        if (!success) {
          toast.error(message || "Update failed");
          return;
        }
        toast.success("Request updated successfully!");
        getData();
      }
    },
    handleConfirm: async (ids) => {
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Confirm for DO'`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        const rowsPayload = ids?.map((id) => {
          return {
            id: id,
            doRequestStatusId: data?.[0]?.Id,
            doRejectRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

        const res = await updateStatusRows({
          tableName: "tblDoRequest",
          rows: rowsPayload,
          keyColumn: "id",
        });
        const { success, message } = res || {};
        if (!success) {
          toast.error(message || "Update failed");
          return;
        }
        toast.success("Request updated successfully!");
        getData();
      }
    },
    handleRelease: async (ids, releaseAttachment, submitHandler) => {
      if (releaseAttachment?.tblAttachmentRelease?.length <= 0) {
        toast.warn("Please DO Release Attach first for DO Release!");
        return;
      }
      const obj = {
        columns: "id as Id, name as Name",
        tableName: "tblMasterData",
        whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Released for DO'`,
      };
      const { data, success } = await getDataWithCondition(obj);
      if (success) {
        const rowsPayload = ids?.map((id) => {
          return {
            id: id,
            doRequestStatusId: data?.[0]?.Id,
            doRejectRemarks: null,
            updatedBy: userData?.userId,
            updatedDate: new Date(),
          };
        });

        const res = await updateStatusRows({
          tableName: "tblDoRequest",
          rows: rowsPayload,
          keyColumn: "id",
        });
        const { success, message } = res || {};
        if (!success) {
          toast.error(message || "Update failed");
          return;
        }
        submitHandler();
        toast.success("DO Released successfully!");
      }
    },
    handleReject: async (rejectState, setRejectState) => {
      if (rejectState.value) {
        const obj = {
          columns: "id as Id, name as Name",
          tableName: "tblMasterData",
          whereCondition: `masterListName = 'tblDoStatus' and status = 1 and name = 'Reject for DO'`,
        };
        const { data, success } = await getDataWithCondition(obj);
        if (success) {
          const rowsPayload = rejectState?.ids?.map((id) => {
            return {
              id: id,
              doRequestStatusId: data?.[0]?.Id,
              doRejectRemarks: rejectState?.value,
              updatedBy: userData?.userId,
              updatedDate: new Date(),
            };
          });

          const res = await updateStatusRows({
            tableName: "tblDoRequest",
            rows: rowsPayload,
            keyColumn: "id",
          });
          const { success, message } = res || {};
          if (!success) {
            toast.error(message || "Update failed");
            return;
          }
          toast.success("Reject updated successfully!");
          setRejectState((prev) => ({ ...prev, toggle: false, value: null }));
          getData();
        }
      } else {
        toast.warn("Please enter reject remark!");
      }
    },
    handleGenerateDO: async (ids, setReportModalForRow, setReportModalOpen) => {
      try {
        const blQuery = {
          columns: "b.id, b.mblHblFlag",
          tableName: "tblDoRequest d",
          joins: `
             left join tblBl b on isnull(b.hblNo, b.mblNo) = d.blNo and b.shippingLineId = d.shippingLineId
            `,
          whereCondition: `d.id = ${ids?.[0]} and b.status = 1 and d.status = 1`,
        };

        const { success, data } = await getDataWithCondition(blQuery);

        if (success && data?.length > 0) {
          setReportModalForRow({ id: data?.[0]?.id, clientId: 1 });
          setReportModalOpen(true);
        } else {
          toast.warn("Again this DO Request does not have Bl in system!");
        }
      } catch (error) {
        console.log("error", error);
      }
    },
  };
};

export function statusColor(status) {
  const color = {
    RejectforDO: "#DC0E0E",
    RequestforDO: "#4E61D3",
    ConfirmforDO: "green",
    PendingforDO: "#F4B342",
    ReleasedforDO: "#007E6E",
  };
  return color[status];
}

export const BlurEventFunctions = ({ formData, setFormData, jsonData }) => {
  return {
    fetchInvoicePaymentByBlAndLiner: async (event) => {
      const { name, value } = event.target;
      const blNo = value?.trim();

      if (!blNo) return;

      const linerId = formData?.shippingLineId?.Id;

      if (!linerId) {
        toast.warn("Select Liner first.");
        return;
      }

      const blCheckQuery = {
        columns: "id",
        tableName: "tblDoRequest",
        whereCondition: `blNo = '${blNo}' AND status = 1 AND shippingLineId = ${linerId}`,
      };

      const { success: blCheckSuccess, data: blCheckData } =
        await getDataWithCondition(blCheckQuery);

      if (blCheckSuccess && blCheckData?.length > 0) {
        toast.warn("This blNo already exist in DO request!");
        setFormData((prev) => ({
          shippingLineId: formData?.shippingLineId,
          blNo: null,
        }));
        return;
      }

      try {
        const blQuery = {
          columns: "TOP 1 id, mblHblFlag",
          tableName: "tblBl",
          whereCondition: `ISNULL(hblNo, mblNo) = '${blNo}' AND 1 = 1 AND shippingLineId = ${linerId}`,
        };

        const { success: blSuccess, data: blData } =
          await getDataWithCondition(blQuery);

        if (!blSuccess || !Array.isArray(blData) || blData.length <= 0) {
          toast.warn("BL not found for selected Liner.");
        } else {
          const blId = blData?.[0]?.id;
          const format = formatFetchForm(
            jsonData,
            "tblBl",
            blId,
            '["tblBlContainer"]',
            "blId",
          );
          const { result } = await fetchForm(format);
          const getData = formatDataWithForm(result, jsonData);
          const convertData = {};
          for (let [key, value] of Object.entries(getData)) {
            if (value) {
              convertData[key] = value;
            }
          }
          const updateTblContainer = getData?.tblBlContainer?.map((subItem) => {
            return { ...subItem, selectForDO: true };
          });
          setFormData({
            ...convertData,
            blNo: value,
            blId: blId,
            cargoTypeId: null,
            tblBlContainer: updateTblContainer,
          });
        }
      } catch (e) {
        console.error(e);
        toast.warn("BL not found for selected Liner.");
      }

      try {
        const invoiceQuery = {
          columns:
            "m2.name paymentTypeId, i.Amount Amount, i.bankName bankName, i.bankBranchName bankBranchName, i.referenceNo referenceNo, i.referenceDate referenceDate, m.name paymentStatusId, (select string_agg(i2.invoiceNo, ',') from tblInvoice i2 where  i2.id in (select try_cast(value as int) from string_split(i.invoiceIds, ','))) invoiceIds",
          tableName: "tblInvoicePayment i",
          joins: `left join tblMasterData m on m.id = i.paymentStatusId
                  left join tblMasterData m2 on m2.id = i.paymentTypeId `,
          whereCondition: `i.blNo = '${blNo}' and i.status = 1 and i.status = 1 and m.name = 'Payment Confirmed'`,
        };

        const { success: invoiceSuccess, data: invoiceData } =
          await getDataWithCondition(invoiceQuery);
        if (invoiceSuccess && invoiceData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tblInvoicePayment: invoiceData,
          }));
        }
      } catch (error) {
        console.log("error", error);
        toast.warn("Payment details not found again this BL.");
      }
    },
  };
};

export const changeEventFunctions = ({
  mode,
  setFormData,
  formData,
  setJsonData,
}) => {
  return {
    freeDaysChangeHandler: async (name, value) => {
      if (value === "Y") {
        try {
          const obj = {
            columns: "vor.arrivalDate",
            tableName: "tblBl b",
            joins:
              "inner join tblVoyageRoute vor on vor.voyageId = b.podVoyageId and vor.portOfCallId = b.podId",
            whereCondition: `isnull(b.hblNo, b.mblNo) = '${formData?.blNo}' and b.status = 1`,
          };
          const { data, success } = await getDataWithCondition(obj);
          if (success && data.length > 0) {
            setFormData((prev) => {
              const updateTblBlContainer = prev?.tblBlContainer?.map(
                (item) => ({
                  ...item,
                  doValidityDate: data?.[0]?.arrivalDate,
                }),
              );
              return {
                ...prev,
                tblBlContainer: updateTblBlContainer,
              };
            });
          }

          setJsonData((prev) => {
            const updateTblBlContainer = prev?.tblBlContainer.map((item) => {
              if (item.name === "doValidityDate") {
                return { ...item, required: false };
              }

              return item;
            });

            return {
              ...prev,
              tblBlContainer: updateTblBlContainer,
            };
          });
        } catch (e) {
          console.log("error", e.message);
        }
      } else {
        setFormData((prev) => {
          const updateTblBlContainer = prev?.tblBlContainer?.map((item) => ({
            ...item,
            doValidityDate: null,
          }));
          return {
            ...prev,
            tblBlContainer: updateTblBlContainer,
          };
        });

        setJsonData((prev) => {
          const updateTblBlContainer = prev?.tblBlContainer.map((item) => {
            if (item.name === "doValidityDate") {
              return { ...item, required: true };
            }

            return item;
          });

          return {
            ...prev,
            tblBlContainer: updateTblBlContainer,
          };
        });
      }
    },
  };
};

export async function requestHandler(doStatus, blNo) {
  const userData = getUserByCookies();

  const requestStatus = doStatus.filter(
    (item) => item.Name === "Request for DO",
  );
  const obj = {
    columns: "id",
    tableName: "tblDoRequest",
    whereCondition: `blNo = '${blNo}' and status = 1`,
  };
  const { data, success: success2 } = await getDataWithCondition(obj);

  if (success2 && data.length > 0) {
    const rowsPayload = [
      {
        id: data?.[0]?.id,
        doRequestStatusId: requestStatus?.[0]?.Id,
        doRejectRemarks: null,
        updatedBy: userData?.userId,
        updatedDate: new Date(),
      },
    ];
    const res = await updateStatusRows({
      tableName: "tblDoRequest",
      rows: rowsPayload,
      keyColumn: "id",
    });
    const { success, message } = res || {};
    if (!success) {
      toast.error(message || "Update failed");
      return;
    }
    toast.success("Request updated successfully!");
  } else {
    toast.warn("Do Request Id  not fund again this form!");
  }
}

export async function getDORequest({
  setFormData,
  setFieldsMode,
  mode,
  jsonData,
  setReleaseAttachment,
}) {
  const format = formatFetchForm(
    jsonData,
    "tblDoRequest",
    mode.formId,
    '["tblAttachment"]',
    "doRequestId",
  );
  const { result } = await fetchForm(format);
  const getData = formatDataWithForm(result, jsonData);
  const obj = {
    columns: "id as id",
    tableName: "tblBl",
    whereCondition: `isnull(hblNo, mblNo) = '${getData.blNo}' and status = 1`,
  };
  const { data, success } = await getDataWithCondition(obj);

  const invoiceQuery = {
    columns:
      "m2.name paymentTypeId, i.Amount Amount, i.bankName bankName, i.bankBranchName bankBranchName, i.referenceNo referenceNo, i.referenceDate referenceDate, m.name paymentStatusId, (select string_agg(i2.invoiceNo, ',') from tblInvoice i2 where  i2.id in (select try_cast(value as int) from string_split(i.invoiceIds, ','))) invoiceIds",
    tableName: "tblInvoicePayment i",
    joins: `left join tblMasterData m on m.id = i.paymentStatusId
                  left join tblMasterData m2 on m2.id = i.paymentTypeId `,
    whereCondition: `i.blNo = '${getData.blNo}' and i.status = 1 and i.status = 1 and m.name = 'Payment Confirmed'`,
  };

  const { success: invoiceSuccess, data: invoiceData } =
    await getDataWithCondition(invoiceQuery);

  if (data?.length > 0 && success) {
    const format2 = formatFetchForm(
      jsonData,
      "tblBl",
      data?.[0]?.id,
      '["tblBlContainer"]',
      "blId",
    );
    const { result: result2 } = await fetchForm(format2);
    const getData2 = formatDataWithForm(result2, jsonData);
    if (mode.mode !== "edit" && mode.mode !== "view") {
      const updateTblContainer = getData2?.tblBlContainer?.map((subItem) => {
        return { ...subItem, selectForDO: true };
      });
      setFormData({
        ...getData,
        blId: result?.blId,
        tblBlContainer: updateTblContainer,
      });
    } else {
      setFormData({
        ...getData,
        blId: result?.blId,
        tblBlContainer: getData2?.tblBlContainer ?? [],
        tblAttachment: getData?.tblAttachment?.filter(
          (subItem) =>
            subItem.attachmentTypeId?.Name !== "DO Released" &&
            subItem.attachmentTypeId?.Name !== "Empty Letter",
        ),
      });
      const setReleasedAttach = getData?.tblAttachment?.filter(
        (subItem) =>
          subItem.attachmentTypeId?.Name === "DO Released" ||
          subItem.attachmentTypeId?.Name === "Empty Letter",
      );
      setReleaseAttachment({ tblAttachmentRelease: setReleasedAttach });
    }
  } else {
    const updateAttach = getData?.tblAttachment?.filter(
      (subItem) =>
        subItem.attachmentTypeId?.Name !== "DO Released" &&
        subItem.attachmentTypeId?.Name !== "Empty Letter",
    );
    setFormData({ ...getData, tblAttachment: updateAttach });
    const setReleasedAttach = getData?.tblAttachment?.filter(
      (subItem) =>
        subItem.attachmentTypeId?.Name === "DO Released" ||
        subItem.attachmentTypeId?.Name === "Empty Letter",
    );
    setReleaseAttachment({ tblAttachmentRelease: setReleasedAttach });
  }

  if (invoiceSuccess && invoiceData.length > 0) {
    setFormData((prev) => ({
      ...prev,
      tblInvoicePayment: invoiceData,
    }));
  }

  setFieldsMode(mode.mode);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch?.blNo) {
    condition.push(`d.blNo = '${advanceSearch?.blNo}'`);
  }

  if (advanceSearch?.doRequestStatusId) {
    condition.push(
      `d.doRequestStatusId in (${advanceSearch?.doRequestStatusId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }

  if (advanceSearch.shippingLineId) {
    condition.push(
      `d.shippingLineId in (${advanceSearch.shippingLineId
        .map((item) => item.Id)
        .join(",")})`,
    );
  }

  if (advanceSearch?.companyId) {
    condition.push(
      `c1.name in (${advanceSearch?.companyId
        .map((item) => `'${item.Name}'`)
        .join(",")})`,
    );
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export function checkAttachment(formData) {
  let checkValid = true;
  if (formData?.isFreeDays === "N") {
    checkValid = formData?.tblBlContainer?.every((item) => {
      return item.doValidityDate;
    });
  }

  const allCheck = [checkValid, formData?.tblAttachment?.length > 0].some(
    (item) => item === false,
  );

  if (allCheck === true) {
    toast.warn(
      "Please add attachment or valid till in all container before submit!",
    );
    return true;
  }

  return false;
}

/**
 * Generates HTML content from a hidden iframe report
 */
export const generateHTMLFromReport = async (reportType, formId) => {
  return new Promise(async (resolve) => {
    try {
      const obj = {
        columns: "blId",
        tableName: "tblDoRequest",
        whereCondition: `id = '${formId}'`,
      };

      const { data, success } = await getDataWithCondition(obj);

      if (!success || !data || data.length === 0) {
        toast.error("NO BL FOUND!");
        resolve(null);
        return;
      }

      const blId = data[0]?.blId;
      const iframe = document.createElement("iframe");

      Object.assign(iframe.style, {
        display: "none",
        visibility: "hidden",
        position: "absolute",
        width: "0px",
        height: "0px",
        left: "-9999px",
      });

      const rid = encodeURIComponent(blId);
      const reportUrl = `/htmlReports/rptDoLetter?recordId=${rid}&clientId=1&mode=combined&selected=${encodeURIComponent(reportType)}`;

      let timeoutId;

      iframe.onload = async () => {
        try {
          clearTimeout(timeoutId);
          await new Promise((r) => setTimeout(r, 3000));

          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          if (!iframeDoc) throw new Error("Iframe document not accessible");

          let reportRoot = iframeDoc.querySelector("#report-root");
          let rawContent = reportRoot
            ? reportRoot.outerHTML
            : iframeDoc.body.innerHTML;

          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = rawContent;
          tempDiv.querySelectorAll(".no-print").forEach((el) => el.remove());

          const resetStyles = `
            <style>
              @page { margin: 0mm; size: auto; }
              body { margin: 0; padding: 0; }
              #report-root { 
                margin: 0 !important; 
                padding: 0 !important; 
                page-break-after: avoid !important;
                height: auto !important;
              }
              * { box-sizing: border-box; }
            </style>
          `;

          const finalHtml = resetStyles + tempDiv.innerHTML.trim();

          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          resolve(finalHtml);
        } catch (error) {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          resolve(null);
        }
      };

      timeoutId = setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        resolve(null);
      }, 15000);

      iframe.src = reportUrl;
      document.body.appendChild(iframe);
    } catch (error) {
      toast.error("Error generating report");
      resolve(null);
    }
  });
};

/**
 * Handles PDF generation, attachment type mapping, and state updates
 */
export const uploadAndAttachDO = async ({
  generatingDO,
  setGeneratingDO,
  mode,
  setReleaseAttachment,
}) => {
  if (generatingDO) return;
  setGeneratingDO(true);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // 1. Fetch Attachment Type IDs
    const masterObj = {
      columns: "id, name",
      tableName: "tblMasterData",
      whereCondition:
        "masterListName = 'tblInvoiceAttachmentType' AND name IN ('DO Released', 'Empty Letter')",
    };

    const masterRes = await getDataWithCondition(masterObj);
    const typeMapping = {};
    if (masterRes.success) {
      masterRes.data.forEach((item) => {
        typeMapping[item.name] = { Id: item.id, Name: item.name };
      });
    }

    const reportTypes = ["Delivery Order", "EmptyOffLoadingLetter"];

    for (const reportType of reportTypes) {
      // Call the sibling function
      const htmlContent = await generateHTMLFromReport(reportType, mode.formId);
      if (!htmlContent) continue;

      const pdfResponse = await fetch(`${baseUrl}api/v1/localPDFReports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: htmlContent,
          orientation: "portrait",
          pdfFilename: reportType.replace(/[\\/:*?"<>|]+/g, "_"),
        }),
      });

      if (!pdfResponse.ok)
        throw new Error(`PDF generation failed for ${reportType}`);

      const blob = await pdfResponse.blob();
      const file = new File([blob], `${Date.now()}-${reportType}.pdf`, {
        type: "application/pdf",
      });

      const typeName =
        reportType === "Delivery Order" ? "DO Released" : "Empty Letter";
      const attachmentTypeId = typeMapping[typeName];

      // 3. Update the component state
      setReleaseAttachment((prev) => ({
        ...prev,
        tblAttachmentRelease: [
          ...(prev?.tblAttachmentRelease || []),
          {
            path: file,
            remarks: null,
            attachmentTypeId: attachmentTypeId,
          },
        ],
      }));

      await new Promise((r) => setTimeout(r, 1000));
      toast.success(`${reportType} attached successfully!`);
    }
  } catch (error) {
    toast.error(error?.message || "Error generating DOs");
  } finally {
    setGeneratingDO(false);
  }
};
