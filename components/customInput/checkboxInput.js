import React from "react";
import { Box, Checkbox } from "@mui/material";

const CheckBoxInput = ({
  commonProps,
  fieldValue,
  changeHandler,
  containerIndex,
}) => {
  return (
    <Box
      className={`relative py-[5px] px-[10px] border border-solid border-[#0000003b] rounded-[4px] placeholder-[#000000a6] hover:border-black ${commonProps.className} `}
      key={commonProps.key}
    >
      <Checkbox
        checked={fieldValue}
        disabled={commonProps.disabled}
        onChange={(e) =>
          changeHandler(
            {
              target: { name: commonProps.name, value: e.target.checked },
            },
            containerIndex
          )
        }
      />
      <p
        className={`absolute text-[#00000099] font-medium text-xs my-1 mx-3 px-1 top-[-11px] bg-white text-[9px]`}
      >
        {commonProps.label}
      </p>
    </Box>
  );
};

export default CheckBoxInput;
