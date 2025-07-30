import * as React from "react";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

const RadioInput = ({
  commonProps,
  fieldValue,
  field,
  changeHandler,
  containerIndex,
}) => {
  return (
    <FormControl
      className={`relative py-[5px] !px-[10px] !border !border-solid !border-[#0000003b] rounded-[4px] placeholder-[#000000a6] hover:!border-black ${commonProps.className}`}
    >
      <FormLabel
        className={`!absolute font-medium !text-xs my-1 mx-3 w-fit !px-1 top-[-10px] bg-white !text-[9px]`}
      >
        {commonProps.label}
      </FormLabel>
      <RadioGroup row name="row-radio-buttons-group" value={fieldValue}>
        {field?.radioData?.map((item) => {
          return (
            <FormControlLabel
              key={item.value}
              value={item.value}
              control={<Radio />}
              label={item.label}
              disabled={commonProps.disabled}
              onClick={() =>
                changeHandler(
                  {
                    target: { name: commonProps.name, value: item.value },
                  },
                  containerIndex
                )
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioInput;
