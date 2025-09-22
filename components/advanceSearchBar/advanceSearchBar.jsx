import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
} from "@mui/material";
import FilterListAltIcon from "@mui/icons-material/FilterListAlt";
import CustomButton from "@/components/button/button";
import { CustomInput } from "@/components/customInput";
import FormHeading from "../formHeading/formHeading";

export default function AdvancedSearchBar({
  fields,
  advanceSearch,
  setAdvanceSearch,
  rowsPerPage,
  getData,
}) {
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    getData(1, rowsPerPage);
    setOpen(false);
  };

  return (
    <>
      <CustomButton
        startIcon={<FilterListAltIcon />}
        buttonStyles={`!bg-[#95a9e8] !text-white !text-[10px] !px-1 !py-1 !text-base !font-semibold rounded-md `}
        text={"Advance search"}
        onClick={() => setOpen(true)}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <FormHeading text="Advanced Search" />
        <DialogContent dividers>
          <Box className="grid grid-cols-2 gap-2 p-1 ">
            <CustomInput
              fields={fields}
              formData={advanceSearch}
              setFormData={setAdvanceSearch}
              fieldsMode="edit"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton
            buttonStyles="!bg-[#F5554A] !text-white !text-[10px] !px-1 !py-1 !text-base !font-semibold rounded-md"
            onClick={() => setAdvanceSearch({})}
            text="Clear"
          />
          <CustomButton
            buttonStyles="!bg-[#F5554A] !text-white !text-[10px] !px-1 !py-1 !text-base !font-semibold rounded-md"
            onClick={() => setOpen(false)}
            text="Cancel"
          />
          <CustomButton
            buttonStyles="!bg-[#95a9e8] !text-white !text-[10px] !px-1 !py-1 !text-base !font-semibold rounded-md"
            text="Search"
            onClick={handleSearch}
          />
        </DialogActions>
      </Dialog>
    </>
  );
}
