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
      className={`flex items-end !flex-row gap-2 ${commonProps.className}`}
    >
      <FormLabel className={`!font-bold w-fit bg-white !text-[11px]`}>
        {commonProps.label}
      </FormLabel>
      <RadioGroup
        row
        name="row-radio-buttons-group"
        value={fieldValue}
        className="flex items-end border-b  border-solid border-[rgba(0,0,0,0.42)] px-2 w-full"
      >
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
