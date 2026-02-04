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
  fieldHighLight,
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

            // ✅ Always parse stored ISO value
            value={fieldValue ? dayjs(fieldValue) : null}

            // ✅ On submit/store -> always send ISO to backend
            onChange={(date) => {
              const isoValue = date
                ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
                : null;

              changeHandler(
                {
                  target: {
                    name: commonProps.name,
                    value: isoValue,
                  },
                },
                containerIndex
              );
            }}

            // ✅ Display for user in Indian format
            format="DD/MM/YYYY hh:mm A"

            slotProps={{
              textField: {
                placeholder: "DD/MM/YYYY hh:mm AM/PM",
                variant: "standard",
                label: null,
                required: commonProps.required,
              },
            }}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

export default DateTimeInput;
