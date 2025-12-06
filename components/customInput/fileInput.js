import React, { useState } from "react";
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

const BrowserButton = ({ onChange, commonProps, handleDrop }) => {
  return (
    <Box
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`flex flex-col items-center justify-center border-1 border-dashed rounded-md cursor-pointer transition-colors min-w-[20px] border-blue-500 bg-blue-50`}
    >
      <CloudUploadIcon className="text-[#95a9e8] text-xl mb-0.5" />
      <Typography variant="body2" className="text-gray-500 text-[11px]">
        Drag & Drop
      </Typography>
      <Typography variant="body2" className="text-gray-400 text-[10px]">
        OR
      </Typography>
      <Button
        component="label"
        className="!mt-0.5 !text-[10px] !py-0.5 !rounded !border !border-gray-300 !text-[#95a9e8]"
      >
        Browser
        <VisuallyHiddenInput
          key={commonProps.key}
          type="file"
          accept="*/*"
          required={commonProps.required}
          onChange={onChange}
        />
      </Button>
    </Box>
  );
};

const UploadedFile = ({ fileName, onCancel }) => {
  return (
    <Box className="flex justify-center mt-2">
      <Box className="flex items-center justify-between border border-gray-300 rounded px-2 py-[2px] min-h-[40px] max-h-[40px] w-[200px] bg-white shadow-sm">
        <Box className="flex items-center gap-1 overflow-hidden flex-1">
          <CloudUploadIcon className="text-[12px] text-[#95a9e8]" />
          <Typography
            variant="body2"
            className="!text-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {fileName?.name?.split(/-(.+)/)[1] || fileName?.split(/-(.+)/)[1]}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onCancel} className="p-0.5">
          <CloseIcon className="text-[12px] text-[#f73a3a]" />
        </IconButton>
      </Box>
    </Box>
  );
};

const FileInput = ({
  commonProps,
  changeHandler,
  containerIndex,
  fieldValue,
  field,
  fieldHighLight
}) => {
  const { label, ...remainingProps } = commonProps;

  function fileUploadHandler(file) {
    if (file) {
      const newFileName = Date.now() + "-" + file.name;
      const modifiedFile = new File([file], newFileName, { type: file.type });
      changeHandler(
        { target: { name: commonProps.name, value: modifiedFile } },
        containerIndex
      );
    }
  }

  function inputFileChangeHandler(event) {
    fileUploadHandler(event.target.files[0]);
  }

  function fileCancelHandler() {
    changeHandler(
      { target: { name: commonProps.name, value: null } },
      containerIndex
    );
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    fileUploadHandler(file);
  }

  return (
    <Box
      className={`flex gap-1 w-full ${
        field?.dragDrop ? "flex-col" : "items-end flex-row"
      } `}
    >
      {label && (
        <InputLabel  className={`${fieldHighLight && "bg-[#FDACAC]"}`} >
          {remainingProps.required && (
            <span className="text-red-600 font-bold ">┃</span>
          )}
          {label}
        </InputLabel>
      )}
      {!fieldValue ? (
        field?.dragDrop ? (
          <BrowserButton
            commonProps={commonProps}
            onChange={inputFileChangeHandler}
            handleDrop={handleDrop}
          />
        ) : (
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
              onChange={inputFileChangeHandler}
            />
          </Button>
        )
      ) : (
        <UploadedFile fileName={fieldValue} onCancel={fileCancelHandler} />
      )}
    </Box>
  );
};

export default FileInput;
