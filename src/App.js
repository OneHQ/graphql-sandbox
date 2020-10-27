import React, { useState } from "react";
import { Tabs, Tab } from "@material-ui/core";
import TextField from "./TextField";
import "./styles.css";
import CreateAdvisor from "./CreateAdvisor";
import LastNAdvisors from "./LastNAdvisors";
import useGraphql from "./useGraphql";

export default function App() {
  const [type, setType] = useState("query");
  const [apiKey, setApiKey] = useState();
  const [error, setError] = useState();
  const submitQuery = useGraphql({
    apiKey,
    onError: setError,
    url: "https://agencieshq.com/graphql"
  });

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
    <div className="App">
      <Tabs value={type} onChange={(e, value) => setType(value)}>
        <Tab label="Query Advisors" value="query" />
        <Tab label="Create an Advisor" value="mutate" />
      </Tabs>
      {error && <div className="error">{error}</div>}
      {type === "query" && (
        <LastNAdvisors submitQuery={submitQuery}>
          {renderApiField}
        </LastNAdvisors>
      )}
      {type === "mutate" && (
        <CreateAdvisor onError={onError} submitQuery={submitQuery}>
          {renderApiField}
        </CreateAdvisor>
      )}
    </div>
  );
}
