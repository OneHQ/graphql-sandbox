/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import {
  Link,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
} from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Form from "../../Form";
import TextField from "../../TextField";
import ProductTypesList from "../../helpers/ProductTypesList";
import SearchQuery from "../../helpers/SearchQuery";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

const createContract = `
  mutation CreateContract($attributes: ContractInput!) {
    createContract(attributes: $attributes) {
      errors
      resource {
        id
        name
        carrier {
          id
          name
        }
        advisor {
          id
          name
        }
        productTypes {
          id
          name
        }
      }
    }
  }
`;


export default function CreateContract({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [productTypesList, setProductTypesList] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [data, setData] = useState({type: "Agency"});

  const [advisorsList, setAdvisorsList] = useState([]);
  const [carriersList, setCarriersList] = useState([]);

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData, value, resource) => fetchData(value, resource), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      let result = await ProductTypesList(submitQuery, context.apiKey);
      result = result.filter(el => el.productClassId === 1)
      setProductTypesList(result);
    }

    debounceFetch(fetchData);

  }, [context.apiKey]);

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }

  async function handleKeyPressChange(value, resource) {
    const results =  await SearchQuery(submitQuery, context.apiKey, value, [resource]);
    if (resource === "Advisor") {
      setAdvisorsList(results.results ? results.results : []);
    }
    else if (resource === "Carrier") {
      setCarriersList(results.results ? results.results : []);
    }
  }

  return (
    <div>
      <Form
        onSubmit={async () => {
          const attributes = {
            advisorId: data.advisor,
            carrierId: data.carrier,
            name: `${data.writingNumber} (Individual)`,
            productClassId: 1,
            writingNumber: data.writingNumber
          };

          if (data.productType)
            attributes.contractLevels = [{
              contractStatus: "Active",
              productTypeId: data.productType
            }];

          const response = await submitQuery(createContract, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createContract.errors;
            const resource = response.createContract.resource;
            if (errors && Object.keys(errors).length) onError(Object.values(errors).join("; "));
            if (resource) setContracts((contracts) => [...contracts, resource]);
          }
        }}
        submitText="Create Contract"
      >
        {children}
        <TextField
          name="name"
          label="Name"
          onChange={handleChange}
          required
        />
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
            />
          )}
        />
      </Form>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell>Advisor</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>Product Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length ? (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/contracts/${contract.id}`}
                    >
                      {contract.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {contract.advisor.name}
                  </TableCell>
                  <TableCell>
                    {contract.carrier.name}
                  </TableCell>
                  <TableCell>
                    {contract.productTypes.map((p) => p.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  No contracts
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
