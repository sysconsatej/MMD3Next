import React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { CustomInput } from "../customInput";
import CustomButton from "../button/button";
import { uploadExcel } from "@/apis";
import { formatExcelDataWithForm } from "@/utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  p: 4,
};

const fileUpload = [
  {
    name: "excelFile",
    type: "fileupload",
    isEdit: true,
  },
];

export default function ExcelModal({
  excelFile,
  setExcelFile,
  setFormData,
  gridName,
  fields,
}) {
  async function handleExcelUpload() {
    if (excelFile?.excelFile) {
      const formData = new FormData();
      formData.append("excelFile", excelFile?.excelFile);
      const { result } = await uploadExcel(formData);
      const res = formatExcelDataWithForm(result, fields);
      setFormData((prev) => ({ ...prev, [gridName]: res }));
      setExcelFile((prev) => ({ ...prev, open: false, excelFile: null }));
    }
  }

  return (
    <div>
      <Modal
        open={excelFile?.open}
        onClose={() => setExcelFile((prev) => ({ ...prev, open: false }))}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box className="flex flex-row items-end gap-2">
            <CustomInput
              fields={fileUpload}
              formData={excelFile}
              setFormData={setExcelFile}
              fieldsMode={"edit"}
            />
            <CustomButton text="Upload" onClick={handleExcelUpload} />
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
