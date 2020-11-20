import React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "../TextField";

export default function addressFieldsArray(statesList, handleChange) {

  return [
    {
      field: <TextField name="address" label="Address" onChange={handleChange} fullWidth/>,
      width: "50%"
    },
    {
      field: statesList.length ? (
        <Autocomplete
          options={statesList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="state"
          onChange={(e, value) => handleChange("state", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="State"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={() => {}}
            />
          )}
        />
      ): null,
      width: statesList.length ? "20%" : "0",
      marginLeft: statesList.length ? "1%" : "0"
    },
    {
      field: <TextField name="city" label="City" onChange={handleChange} fullWidth/>,
      width: "15%",
      marginLeft: "1%"
    },
    {
      field: <TextField name="zipcode" label="Zip Code" onChange={handleChange} fullWidth/>,
      width: "15%",
      marginLeft: "1%"
    }
  ];
}
