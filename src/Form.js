import React, { useState } from "react";
import { Button } from "@material-ui/core";

export default function Form({
  children,
  disabled,
  onSubmit,
  submitText = "Submit"
}) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit();
        setSubmitting(false);
      }}
    >
      {children}
      <Button
        color="primary"
        disabled={disabled || submitting}
        type="submit"
        variant="contained"
      >
        {submitText}
      </Button>
    </form>
  );
}
