import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const DateTimeInput = ({
  commonProps,
  fieldValue,
  changeHandler,
  containerIndex,
}) => {
  return (
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
            },
          }}
          format="DD/MM/YYYY HH:mm:ss"
          key={commonProps.key}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default DateTimeInput;
