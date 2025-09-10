import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Box, InputLabel } from "@mui/material";

const DateInput = ({
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          {...commonProps}
          className="datepicker"
          value={fieldValue ? dayjs(fieldValue, "YYYY/MM/DD") : null}
          onChange={(date) => {
            const formattedDate = date
              ? dayjs(date).format("YYYY/MM/DD")
              : null;
            changeHandler(
              { target: { name: commonProps.name, value: formattedDate } },
              containerIndex
            );
          }}
          slotProps={{
            textField: {
              placeholder: "DD/MM/YYYY",
              inputProps: { readOnly: false },
              variant: "standard",
              label: null,
              required: commonProps.required,
            },
          }}
          format="DD/MM/YYYY"
          key={commonProps.key}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateInput;
