import React from "react";
import { Box, Button, IconButton, Typography, InputLabel } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

const VisuallyHiddenInput = (props) => (
  <input
    {...props}
    className="absolute w-[1px] h-[1px] overflow-hidden bottom-0 left-0 whitespace-nowrap clip-path-inset"
    aria-hidden="true"
  />
);

const FileInput = ({
  commonProps,
  changeHandler,
  containerIndex,
  fieldValue,
}) => {
  const { label, ...remainingProps } = commonProps;

  function fileUploadHandler(event) {
    const file = event.target.files[0];
    if (file) {
      const newFileName = Date.now() + "-" + file.name;
      const modifiedFile = new File([file], newFileName, { type: file.type });
      changeHandler(
        { target: { name: commonProps.name, value: modifiedFile } },
        containerIndex
      );
    }
  }

  function fileCancelHandler() {
    changeHandler(
      { target: { name: commonProps.name, value: null } },
      containerIndex
    );
  }

  return (
    <Box className="flex items-end gap-2">
      <InputLabel>
        {remainingProps.required && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {label}
      </InputLabel>
      {!fieldValue ? (
        <Button
          component="label"
          startIcon={<CloudUploadIcon />}
          className="!flex-1 !border-b !border-gray-300 !rounded-none !text-[10px] !font-normal !px-2 !py-[2px] !min-h-[28px] !max-h-[28px] !text-[#95a9e8] !overflow-hidden !flex !items-center !cursor-pointer"
        >
          Select File
          <VisuallyHiddenInput
            key={commonProps.key}
            type="file"
            accept={"*/*"}
            required={commonProps.required}
            onChange={(event) => fileUploadHandler(event)}
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
              {fieldValue?.name?.split(/-(.+)/)[1] ||
                fieldValue?.split(/-(.+)/)[1]}
            </Typography>
          </Box>
          <IconButton size="small" onClick={fileCancelHandler}>
            <CloseIcon className="text-[14px] text-[#e89595]" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default FileInput;
