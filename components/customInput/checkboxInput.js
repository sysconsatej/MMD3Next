import React from "react";
import { Box, Checkbox, InputLabel } from "@mui/material";

const CheckBoxInput = ({
  commonProps,
  fieldValue,
  changeHandler,
  containerIndex,
}) => {
  return (
    <Box className="flex items-end gap-2">
      <InputLabel>
        {commonProps.required && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {commonProps.label}
      </InputLabel>
      <Checkbox
        checked={fieldValue}
        disabled={commonProps.disabled}
        required={commonProps.required}
        onChange={(e) =>
          changeHandler(
            {
              target: { name: commonProps.name, value: e.target.checked },
            },
            containerIndex
          )
        }
      />
    </Box>
  );
};

export default CheckBoxInput;
