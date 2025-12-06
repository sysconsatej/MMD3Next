import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { Box, InputLabel } from "@mui/material";

const DateTimeInput = ({
  commonProps,
  fieldValue,
  changeHandler,
  containerIndex,
  fieldHighLight
}) => {
  return (
    <Box className="flex items-end gap-2">
      <InputLabel className={`${fieldHighLight && "bg-[#FDACAC]"}`}>
        {commonProps.required && (
          <span className="text-red-600 font-bold ">┃</span>
        )}
        {commonProps.label}
      </InputLabel>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={["DateTimePicker"]}>
          <DateTimePicker
            {...commonProps}
            className="datepicker"
            value={fieldValue ? dayjs(fieldValue, "DD/MM/YYYY HH:mm:ss") : null}
            onChange={(date) => {
              const formattedDate = date
                ? dayjs(date).format("DD/MM/YYYY HH:mm:ss")
                : null;
              changeHandler(
                { target: { name: commonProps.name, value: formattedDate } },
                containerIndex
              );
            }}
            slotProps={{
              textField: {
                placeholder: "DD/MM/YYYY HH:mm:ss",
                inputProps: { readOnly: false },
                variant: "standard",
                label: null,
                required: commonProps.required,
              },
            }}
            format="DD/MM/YYYY HH:mm:ss"
            key={commonProps.key}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

export default DateTimeInput;
