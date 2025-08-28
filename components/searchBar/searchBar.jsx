import React from "react";
import CustomButton from "../button/button";
import { Autocomplete, Box, TextField } from "@mui/material";
import { textFieldStyles } from "@/styles";
import { toast } from "react-toastify";

const SearchBar = ({
  getData,
  rowsPerPage,
  search,
  setSearch,
  options = [],
}) => {
  const handleSearch = () => {
    if (!search.searchColumn || !search.searchValue) {
      toast.warn("Something went wrong!");
    }
    getData(1, rowsPerPage);
  };

  return (
    <Box className="flex items-center gap-2 ">
      <Autocomplete
        disablePortal
        options={options}
        sx={{ ...textFieldStyles(), lineHeight: "normal" }}
        renderInput={(params) => <TextField {...params} label="Search" />}
        onChange={(event, value) =>
          setSearch((prev) => ({
            ...prev,
            searchColumn: value?.value,
          }))
        }
      />
      <TextField
        sx={{
          ...textFieldStyles(),
          "& .MuiInputLabel-root": {
            fontSize: "12px",
          },
          "& .MuiFormLabel-root:not(& .MuiInputLabel-shrink)": {
            transform: "translate(14px, 1px) scale(1)",
          },
        }}
        label="Search Value"
        variant="outlined"
        onChange={(event) =>
          setSearch((prev) => ({ ...prev, searchValue: event.target.value }))
        }
      />
      <CustomButton
        text={"Search"}
        buttonStyles={`!text-[white] !leading-[11px] !bg-[#ffc400] !text-[9px]`}
        onClick={handleSearch}
      />
    </Box>
  );
};

export default SearchBar;
