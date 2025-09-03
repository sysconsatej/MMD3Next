"use client";

import React, { useState } from "react";
import { Box, InputLabel, TextField } from "@mui/material";

const TextInput = ({
  commonProps,
  fieldValue,
  handleBlurEventFunctions,
  field,
  handleChange,
}) => {
  const { label, ...remainingProps } = commonProps;

  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const validate = (value) => {
    if (field.required && !value) {
      setError(`${field.label} is required.`);
    } else {
      setError("");
    }
  };

  const onBlurHandler = (event) => {
    setTouched(true);

    if (field.blurFun && handleBlurEventFunctions?.[field.blurFun]) {
      handleBlurEventFunctions[field.blurFun](event);
    }

    validate(event.target.value);
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    handleChange?.(field, value);
    validate(value); // live validation
  };

  return (
    <Box className="flex items-end gap-2">
      <InputLabel>
        {label} {field.required && <span style={{ color: "red" }}>*</span>}
      </InputLabel>
      <TextField
        {...remainingProps}
        value={fieldValue || ""}
        variant="standard"
        key={commonProps.key}
        onBlur={onBlurHandler}
        onChange={onChangeHandler}
        error={Boolean(error)}
        // helperText={error}
        required={field?.required}
        fullWidth
      />
    </Box>
  );
};

export default TextInput;
