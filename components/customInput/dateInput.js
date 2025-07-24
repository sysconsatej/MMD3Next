import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DateInput = ({ commonProps, fieldValue, changeHandler, containerIndex }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...commonProps}
        className="datepicker"
        value={fieldValue ? dayjs(fieldValue, "DD/MM/YYYY") : null}
        onChange={(date) => {
          const formattedDate = date ? dayjs(date).format("DD/MM/YYYY") : null;
          changeHandler(
            { target: { name: commonProps.name, value: formattedDate } },
            containerIndex
          );
        }}
        slotProps={{
          textField: {
            placeholder: "DD/MM/YYYY",
            inputProps: { readOnly: false },
          },
        }}
        format="DD/MM/YYYY"
        key={commonProps.key}
      />
    </LocalizationProvider>
  );
};

export default DateInput;
