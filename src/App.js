import React, { useState, useEffect } from "react";
import { InputLabel, FormControl, makeStyles, MenuItem, Select, Tabs, Tab } from "@material-ui/core";
import TextField from "./TextField";
import "./styles.css";
import CreateAdvisor from "./components/Advisor/CreateAdvisor";
import LastNAdvisors from "./components/Advisor/LastNAdvisors";
import CreateClient from "./components/Client/CreateClient";
import LastNClients from "./components/Client/LastNClients";
import CreateContact from "./components/Contact/CreateContact";
import LastNContacts from "./components/Contact/LastNContacts";
import CreateContract from "./components/Contract/CreateContract";
import LastNContracts from "./components/Contract/LastNContracts";
import LastNFirms from "./components/Firm/LastNFirms";
import CreateFirm from "./components/Firm/CreateFirm";
import LastNOpportunities from "./components/Opportunity/LastNOpportunities";
import CreateOpportunity from "./components/Opportunity/CreateOpportunity";
import LastNPolicies from "./components/Policy/LastNPolicies";
import CreatePolicy from "./components/Policy/CreatePolicy";
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

export const GraphqlContext = React.createContext();

export default function App() {
  const [type, setType] = useState("query");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [resource, setResource] = useState("Advisor, Advisors");
  const [graphqlURL, setGraphqlURL] = useState("staging");
  const submitQuery = useGraphql({
    apiKey,
    onError: setError,
      url: graphqlURL === "staging" ? " http://localhost:3000/gql"  : "https://agencieshq.com/graphql"
  });

  useEffect(() => {
    setApiKey("")
    setError("")
  }, [graphqlURL]);

  useEffect(() => {
    setType ("query")
  }, [resource]);

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
    <GraphqlContext.Provider value={{apiKey, graphqlURL}}>
      <div className="AppHeader">
        <FormControl variant="outlined" className={classes.formControlLeft}>
          <InputLabel>Resource</InputLabel>
          <Select
            value={resource}
            onChange={(e, value) => setResource(value.props.value)}
            label="Resource"
          >
            <MenuItem value={"Advisor, Advisors"}>Advisors</MenuItem>
            <MenuItem value={"Client, Clients"}>Clients</MenuItem>
            <MenuItem value={"Contact, Contacts"}>Contacts</MenuItem>
            <MenuItem value={"Contract, Contracts"}>Contracts</MenuItem>
            <MenuItem value={"Firm, Firms"}>Firms</MenuItem>
            <MenuItem value={"Opportunity, Opportunities"}>Opportunities</MenuItem>
            <MenuItem value={"Policy, Policies"}>Policies</MenuItem>
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
          <Tab label={`Query ${resource.split(", ")[1]}`} value="query" />
          <Tab label={`Create an ${resource.split(", ")[0]}`} value="mutate" />
        </Tabs>
        {error && <div className="error">{error}</div>}
        {type === "query" && (
          (resource.split(", ")[0] === "Advisor" && (
            <LastNAdvisors submitQuery={submitQuery} >
              {renderApiField}
            </LastNAdvisors>
          )) ||
          (resource.split(", ")[0] === "Client" && (
            <LastNClients submitQuery={submitQuery} >
              {renderApiField}
            </LastNClients>
          )) ||
          (resource.split(", ")[0] === "Contact" && (
            <LastNContacts submitQuery={submitQuery} >
              {renderApiField}
            </LastNContacts>
          )) ||
          (resource.split(", ")[0] === "Contract" && (
            <LastNContracts submitQuery={submitQuery} >
              {renderApiField}
            </LastNContracts>
          )) ||
          (resource.split(", ")[0] === "Firm" && (
            <LastNFirms submitQuery={submitQuery} >
              {renderApiField}
            </LastNFirms>
          )) ||
          (resource.split(", ")[0] === "Opportunity" && (
            <LastNOpportunities submitQuery={submitQuery} >
              {renderApiField}
            </LastNOpportunities>
          )) ||
          (resource.split(", ")[0] === "Policy" && (
            <LastNPolicies submitQuery={submitQuery} >
              {renderApiField}
            </LastNPolicies>
          ))
        )}
        {type === "mutate" && (
          (resource.split(", ")[0] === "Advisor" && (
            <CreateAdvisor onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateAdvisor>
          )) ||
          (resource.split(", ")[0] === "Client" && (
            <CreateClient onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateClient>
          )) ||
          (resource.split(", ")[0] === "Contact" && (
            <CreateContact onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateContact>
          )) ||
          (resource.split(", ")[0] === "Contract" && (
            <CreateContract onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateContract>
          )) ||
          (resource.split(", ")[0] === "Firm" && (
            <CreateFirm onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateFirm>
          )) ||
          (resource.split(", ")[0] === "Opportunity" && (
            <CreateOpportunity onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreateOpportunity>
          )) ||
          (resource.split(", ")[0] === "Policy" && (
            <CreatePolicy onError={onError} submitQuery={submitQuery} >
              {renderApiField}
            </CreatePolicy>
          ))
        )}
      </div>
    </GraphqlContext.Provider>
  );
}
