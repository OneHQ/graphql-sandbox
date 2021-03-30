/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import _orderBy from "lodash/orderBy"
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";
import TextField from "../TextField";

export default function useFieldAttributesHook(dataFields, handleFieldChange, setInlineFields, selectedFields) {
  useEffect(() => {
    const fields = [];
    async function setFields() {
      const orderedFields = _orderBy(selectedFields, ["style"], ["asc"]);
      let checkboxLine = 0;
      for await(const item of orderedFields){
        if (item.style === "checkbox") {
          checkboxLine += 20;
          fields.push({
            field: <>
              <FormControlLabel
              control={
                <Checkbox
                checked={dataFields[item.name]}
                onChange={e => handleFieldChange(item.name, e.target.checked)}
                inputProps={{ 'aria-label': 'primary checkbox' }}
                label= {item.name}
                />
              }
              label= {item.name}
              />
            </>,
            width: "20%"
          })
        }
        else if (["text", "decimal"].indexOf(item.style) > -1) {
          if (checkboxLine !== -1) {
            fields.push({field: null, width: checkboxLine % 100  === 0 ? "" : `${100 - (checkboxLine % 100)}%`});
            checkboxLine = -1;
          }
          fields.push({
            field:
            <TextField
              name={item.name}
              label={item.name}
              onChange={handleFieldChange}
              required
              type={item.style === "decimal" ? "number" : "text"}
              fullWidth
            />,
            width: "50%",
            marginLeft: "1%"
          })
        }
        else if (["select"].indexOf(item.style) > -1) {
          if (checkboxLine !== -1) {
            fields.push({field: null, width: checkboxLine % 100  === 0 ? "" : `${100 - (checkboxLine % 100)}%`});
            checkboxLine = -1;
          }
          fields.push({
            field:<>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>{item.name}</InputLabel>
                <Select
                  name={item.name}
                  value={dataFields[item.name]}
                  defaultValue={""}
                  onChange={(e) => handleFieldChange(item.name, e.target.value)}
                  label={item.name}
                >
                {item.selectOptions.map(el => (
                  <MenuItem key={el.id} value={el.name}>{el.name}</MenuItem>
                ))}
                </Select>
              </FormControl>
            </>,
            width: "50%",
            marginLeft: "1%"
          })
        }
      };
      setInlineFields(fields);
    };

    setFields()

    return () => setInlineFields([]);

  }, [selectedFields]);
}
