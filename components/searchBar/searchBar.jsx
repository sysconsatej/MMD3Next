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
        sx={{ ...textFieldStyles() }}
        renderInput={(params) => <TextField {...params} label="Search" />}
        onChange={(event, value) =>
          setSearch((prev) => ({
            ...prev,
            searchColumn: value?.value,
          }))
        }
      />
      <TextField
        sx={{ ...textFieldStyles() }}
        label="Search Value"
        variant="outlined"
        onChange={(event) =>
          setSearch((prev) => ({ ...prev, searchValue: event.target.value }))
        }
      />
      <CustomButton
        text={"Search"}
        buttonStyles="!text-[black] !bg-[#fadb0f] !px-[25px] "
        onClick={handleSearch}
      />
    </Box>
  );
};

export default SearchBar;
