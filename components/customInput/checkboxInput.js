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
      className={`relative py-[0px] px-[10px] border border-solid border-[#0000003b] rounded-[4px] placeholder-[#000000a6] hover:border-black ${commonProps.className} `}
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
        className={`absolute text-[#00000099] font-bold text-xs  ml-4 top-[-8px] bg-white text-[10px]`}
      >
        {commonProps.label}
      </p>
    </Box>
  );
};

export default CheckBoxInput;
