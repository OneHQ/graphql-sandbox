import React, { useState } from "react";
import { InputLabel, FormControl, makeStyles, MenuItem, Select, Tabs, Tab } from "@material-ui/core";
import TextField from "./TextField";
import "./styles.css";
import CreateAdvisor from "./components/Advisor/CreateAdvisor";
import LastNAdvisors from "./components/Advisor/LastNAdvisors";
import CreateClient from "./components/Client/CreateClient";
import LastNClients from "./components/Client/LastNClients";
import CreateContact from "./components/Contact/CreateContact";
import LastNContacts from "./components/Contact/LastNContacts";
import useGraphql from "./useGraphql";

const useStyles = makeStyles((theme) => ({
  formControlLeft: {
    margin: theme.spacing(1),
    minWidth: 200,
    float: "left"
  },
  formControlRight: {
    margin: theme.spacing(1),
    minWidth: 200,
    float: "right"
  }
}));

export default function App() {
  const [type, setType] = useState("query");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [resource, setResource] = useState("Advisor");
  const [graphqlURL, setGraphqlURL] = useState("staging");
  const submitQuery = useGraphql({
    apiKey,
    onError: setError,
    url: graphqlURL === "staging" ? " https://agencieshq-staging.agencieshq.com/graphql"  : "https://agencieshq.com/graphql"
  });

  const classes = useStyles();

  const onError = () => setError("Something went wrong");

  const renderApiField = (
    <TextField
      fullWidth
      name="apiKey"
      label="API Key"
      onChange={(_name, value) => setApiKey(value)}
      required
      type="password"
      value={apiKey}
    />
  );

  return (
    <div>
      <div className="AppHeader">
        <FormControl variant="outlined" className={classes.formControlLeft}>
          <InputLabel>Resource</InputLabel>
          <Select
            value={resource}
            onChange={(e, value) => setResource(value.props.value)}
            label="Resource"
          >
            <MenuItem value={"Advisor"}>Advisors</MenuItem>
            <MenuItem value={"Client"}>Clients</MenuItem>
            <MenuItem value={"Contact"}>Contacts</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" className={classes.formControlRight}>
          <InputLabel>Url Option</InputLabel>
          <Select
            value={graphqlURL}
            onChange={(e, value) => setGraphqlURL(value.props.value)}
            label="Url Option"
          >
            <MenuItem value={"staging"}>Staging</MenuItem>
            <MenuItem value={"production"}>Production</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="App">
        <Tabs value={type} onChange={(e, value) => setType(value)}>
          <Tab label={`Query ${resource}s`} value="query" />
          <Tab label={`Create an ${resource}`} value="mutate" />
        </Tabs>
        {error && <div className="error">{error}</div>}
        {type === "query" && (
          (resource === "Advisor" && (
            <LastNAdvisors submitQuery={submitQuery}>
              {renderApiField}
            </LastNAdvisors>
          )) ||
          (resource === "Client" && (
            <LastNClients submitQuery={submitQuery}>
              {renderApiField}
            </LastNClients>
          )) ||
          (resource === "Contact" && (
            <LastNContacts submitQuery={submitQuery}>
              {renderApiField}
            </LastNContacts>
          ))
        )}
        {type === "mutate" && (
          (resource === "Advisor" && (
            <CreateAdvisor onError={onError} submitQuery={submitQuery}>
              {renderApiField}
            </CreateAdvisor>
          )) ||
          (resource === "Client" && (
            <CreateClient onError={onError} submitQuery={submitQuery}>
              {renderApiField}
            </CreateClient>
          )) ||
          (resource === "Contact" && (
            <CreateContact onError={onError} submitQuery={submitQuery}>
              {renderApiField}
            </CreateContact>
          ))
        )}
      </div>
    </div>
  );
}
