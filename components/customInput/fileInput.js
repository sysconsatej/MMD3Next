import React from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

const VisuallyHiddenInput = (props) => (
  <input
    {...props}
    className="absolute w-[1px] h-[1px] overflow-hidden bottom-0 left-0 whitespace-nowrap clip-path-inset"
    aria-hidden="true"
  />
);

const FileInput = ({ commonProps, setFormData, formData }) => {
  const { label, name, accept, multiple } = commonProps;
  const value = formData?.[name] || null;

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: multiple ? [...files] : files[0] });
    }
  };

  const handleRemove = () => {
    setFormData({ ...formData, [name]: multiple ? [] : null });
  };

  return (
    <FormControl fullWidth>
      <Box display="flex" gap={1} alignItems="flex-end">
        {label && (
          <FormLabel className="!min-w-[100px] !flex-shrink-0 !text-[11px] font-normal text-black/60 flex items-end pb-[2px] m-0 leading-[1]">
            {label}
          </FormLabel>
        )}

        {!value ? (
          <Button
            component="label"
            startIcon={<CloudUploadIcon />}
            className="!flex-1 !border-b !border-gray-300 !rounded-none !text-[10px] !font-normal !px-2 !py-[2px] !min-h-[28px] !max-h-[28px] !text-[#95a9e8] !overflow-hidden !flex !items-center !cursor-pointer"
          >
            Select File
            <VisuallyHiddenInput
              type="file"
              name={name}
              accept={accept || "*/*"}
              multiple={multiple}
              onChange={handleFileChange}
            />
          </Button>
        ) : (
          <Box className="  flex items-center justify-between  border border-gray-300 rounded  px-2 py-1  flex-1  min-h-[28px] max-h-[28px]  overflow-hidden">
            <Box className="flex items-center gap-1 overflow-hidden">
              <CloudUploadIcon className="text-[14px] text-[#95a9e8]" />
              <Typography
                variant="body2"
                className="!text-[11px] whitespace-nowrap overflow-hidden overflow-ellipsis"
              >
                {value.name}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleRemove}>
              <CloseIcon className="text-[14px] text-[#e89595]" />
            </IconButton>
          </Box>
        )}
      </Box>
    </FormControl>
  );
};

export default FileInput;
