import React from "react";
import { TextField as MaterialTextField } from "@material-ui/core";

export default function TextField({ error, name, onChange, ...props }) {
  return (
    <MaterialTextField
      error={Boolean(error)}
      variant="outlined"
      name={name}
      onChange={(e) => onChange(name, e.target.value)}
      helperText={error}
      {...props}
    />
  );
}
