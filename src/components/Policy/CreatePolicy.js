/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
} from "@material-ui/core";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DateFnsUtils from '@date-io/date-fns';
import Form from "../../Form";
import TextField from "../../TextField";
import InlineFields from "../../InlineFields";
import OptionsList from "../../helpers/OptionsList";
import ProductsList from "../../helpers/ProductsList";
import ProductTypesList from "../../helpers/ProductTypesList";
import SearchQuery from "../../helpers/SearchQuery";
import StatesList from "../../helpers/StatesList";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

const createPolicy = `
  mutation CreatePolicy($attributes: PolicyInput!) {
    createPolicy(attributes: $attributes) {
      errors
      resource {
        id
        name
        type
        policyNumber
        policyStatus
        signedDate
        advisors {
          id
          name
        }
        clients {
          id
          name
        }
        carrier {
          id
          name
        }
        productType {
          id
          name
        }
        product {
          id
          name
        }
        state {
          id
          name
          abbreviation
        }
      }
    }
  }
`;

export default function CreatePolicy({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [policies, setPolicies] = useState([]);
  const [data, setData] = useState({policyStatus: "PolicyStatus::::Submitted", policyType: "Application", productType: "1", signedDate: new Date()});
  const [options, setOptions] = useState({
    advisor: false,
    client: false,
  });

  const [productTypesList, setProductTypesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [policyStatusList, setPolicyStatusList] = useState([]);
  const [policyTypeList, setPolicyTypeList] = useState([]);

  const [advisorsList, setAdvisorsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [carriersList, setCarriersList] = useState([]);
  const [statesList, setStatesList] = useState([]);

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData, value, resource) => fetchData(value, resource), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      let result = await ProductTypesList(submitQuery, context.apiKey);
      result = result && result.productTypes ? result.productTypes.filter(el => el.productClassId === 1) : []
      setProductTypesList(result);

      result = await StatesList(submitQuery, context.apiKey);
      setStatesList(result && result.states ? result.states : [])

      result = await OptionsList(submitQuery, context.apiKey, "PolicyStatus");
      setPolicyStatusList(result && result.options ? result.options : []);

      result = await OptionsList(submitQuery, context.apiKey, "PolicyType");
      setPolicyTypeList(result && result.options ? result.options : []);
    }

    debounceFetch(fetchData);

  }, [context.apiKey]);

  useEffect(() => {
    async function fetchProducts(){
      let result = await ProductsList(submitQuery, context.apiKey, data.productType ? data.productType.toString() : "");
      result = result && result.products ? result.products.filter(item => item.carrierId === data.carrier) : []
      setProductsList(result);
    }

    fetchProducts();

  }, [data.productType, data.carrier]);


  async function handleKeyPressChange(value, resource) {
    const results =  await SearchQuery(submitQuery, context.apiKey, value, [resource]);
    if (resource === "Advisor") {
      setAdvisorsList(results.results ? results.results : []);
    }
    else if (resource === "Carrier") {
      setCarriersList(results.results ? results.results : []);
    }
    else if (resource === "Client") {
      setClientsList(results.results ? results.results : []);
    }
  }

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }

  const handleOptionsChange = (name, value) => {
    setOptions((d) => ({ ...d, [name]: value }));
  }

  const inlinePolicyOne = [
    {
      field: (
        <TextField
          name="policyNumber"
          label="Policy Number"
          onChange={handleChange}
          fullWidth
          required
        />
      ),
      width: "50%"
    },
    {
      field: (
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
              required
            />
          )}
        />
      ),
      width: "50%",
      marginLeft: "1%"
    }
  ]

  const inlinePolicyTwo = [
    { field: policyStatusList.length ? (
      <>
      <FormControl variant="outlined" fullWidth>
        <InputLabel>Policy Status</InputLabel>
        <Select
          value={data.policyStatus}
          onChange={(e, value) => handleChange("policyStatus", value.props.value)}
          label="Policy Status"
          name= "policyStatus"
          >
          {policyStatusList.map(item => (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      </>
      ) : null,
      width: "50%"
    },
    { field: policyTypeList.length ? (
      <>
      <FormControl variant="outlined" fullWidth>
        <InputLabel>Policy Type</InputLabel>
        <Select
          value={data.policyType}
          onChange={(e, value) => handleChange("policyType", value.props.value)}
          label="Policy Type"
          name= "policyType"
          >
          {policyTypeList.map(item => (
            <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      </>
    ) : null,
    width: "50%",
    marginLeft: "1%"
    },
  ];

  const inlinePolicyThree = [
    {
      field: (
        <Autocomplete
          options={carriersList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="carrier"
          noOptionsText = ""
          onChange={(e, value) => handleChange("carrier", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Find Carrier"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={(e, value) => debounceFetch(handleKeyPressChange, value, "Carrier")}
              required
            />
          )}
        />
      ),
      width: "50%"
    },
    {
      field: (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            autoOk
            fullWidth
            variant="inline"
            inputVariant="outlined"
            label="Signed Date"
            format="MM/dd/yyyy"
            value={data.signedDate}
            InputAdornmentProps={{ position: "start" }}
            onChange={(e, value) => handleChange("signedDate", value)}
            required
          />
        </MuiPickersUtilsProvider>
      ),
      width: "50%",
      marginLeft: "1%"
    }
  ]

  const inlinePolicyFour = [
    {
      field: (
        <Autocomplete
          options={productTypesList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="productType"
          onChange={(e, value) => handleChange("productType", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product Type"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={() => {}}
              required
            />
          )}
        />
      ),
      width: "50%"
    },
    {
      field: (
        <Autocomplete
          options={productsList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="product"
          onChange={(e, value) => handleChange("product", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={() => {}}
              required
            />
          )}
        />
      ),
      width: "50%",
      marginLeft: "1%"
    }
  ]

  return (
    <div>
      <Form
        onSubmit={async () => {
          const stateAbbreviation = statesList.filter(item => item.id === data.state);
          const attributes = {
            carrierId: data.carrier,
            name: `${data.policyNumber ? data.policyNumber : "# Pending"} - ${stateAbbreviation[0].abbreviation}`,
            policyStatusId: data.policyStatus,
            policyNumber: data.policyNumber,
            productTypeId: data.productType,
            productId: data.product,
            type: data.policyType,
            stateId: data.state,
            signedDate: data.signedDate
          };

          if (options.advisor && data.advisor)
            attributes.writingAdvisors = [{
              advisorId: data.advisor,
              isPrimary: true
            }]

          if (options.client && data.client)
            attributes.policyHolders = [{
              clientId: data.client,
              isPayor: true,
              isPrimary: true
            }]

          const response = await submitQuery(createPolicy, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createPolicy.errors;
            const resource = response.createPolicy.resource;
            if (errors && Object.keys(errors).length) onError();
            if (resource) setPolicies((policies ) => [...policies , resource]);
          }
        }}
        submitText="Create Policy"
      >
        {children}
        <InlineFields fields={inlinePolicyOne}/>
        <InlineFields fields={inlinePolicyTwo}/>
        <InlineFields fields={inlinePolicyThree}/>
        <InlineFields fields={inlinePolicyFour}/>
        <FormControlLabel
          control={
            <Checkbox
              checked={options.advisor}
              onChange={() => handleOptionsChange("advisor", !options.advisor)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              label= "Add Advisor"
            />
          }
          label="Add Advisor"
        />
        {options.advisor && (
            <Autocomplete
              options={advisorsList}
              autoHighlight
              getOptionLabel={(option) => option.name}
              renderOption={(option) => option.name}
              name="advisor"
              noOptionsText = ""
              onChange={(e, value) => handleChange("advisor", value ? value.id : null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Find Advisor"
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                  }}
                  onChange={(e, value) => debounceFetch(handleKeyPressChange, value, "Advisor")}
                  required
                />
              )}
            />
          )}
        <FormControlLabel
          control={
            <Checkbox
              checked={options.client}
              onChange={() => handleOptionsChange("client", !options.client)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              label= "Add Client"
            />
          }
          label="Add Client"
        />
      {options.client && (
            <Autocomplete
              options={clientsList}
              autoHighlight
              getOptionLabel={(option) => option.name}
              renderOption={(option) => option.name}
              name="client"
              noOptionsText = ""
              onChange={(e, value) => handleChange("client", value ? value.id : null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Find Client"
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                  }}
                  onChange={(e, value) => debounceFetch(handleKeyPressChange, value, "Client")}
                  required
                />
              )}
            />
          )}
      </Form>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell>type</TableCell>
              <TableCell>Policy Number</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Signed Date</TableCell>
              <TableCell>Advisors</TableCell>
              <TableCell>Clients</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.length ? (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/policies/${policy.id}`}
                    >
                      {policy.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {policy.type}
                  </TableCell>
                  <TableCell>
                    {policy.policyNumber}
                  </TableCell>
                  <TableCell>
                    {policy.productType.name}
                  </TableCell>
                  <TableCell>
                    {policy.product?.name}
                  </TableCell>
                  <TableCell>
                    {policy.carrier.name}
                  </TableCell>
                  <TableCell>
                    {policy.state.name}
                  </TableCell>
                  <TableCell>
                    {policy.policyStatus}
                  </TableCell>
                  <TableCell>
                    {policy.signedDate}
                  </TableCell>
                  <TableCell>
                    {policy.advisors.map((p) => p.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    {policy.clients.map((p) => p.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={11} style={{ textAlign: "center" }}>
                  No policies
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
