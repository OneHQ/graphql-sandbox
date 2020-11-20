/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import {
  FormControl,
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
import Autocomplete from '@material-ui/lab/Autocomplete';
import Form from "../../Form";
import TextField from "../../TextField";
import InlineFields from "../../InlineFields";
import StatesList from "../../helpers/StatesList";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

const createFirm = `
  mutation CreateFirm($attributes: FirmInput!) {
    createFirm(attributes: $attributes) {
      errors
      resource {
        id
        name
        type
        addresses {
          lineOne
          lineTwo
          city
          state {
            id
            name
          }
          zipcode
        }
        emails {
          address
        }
        phones {
          number
        }
      }
    }
  }
`;


export default function CreateFirm({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [firms, setFirms] = useState([]);
  const [data, setData] = useState({type: "Agency"});

  const [statesList, setStatesList] = useState([]);
  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData) => fetchData(), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      let result = await StatesList(submitQuery, context.apiKey);
      setStatesList(result && result.states ? result.states : [])
    }

    debounceFetch(fetchData);

  }, [context.apiKey]);

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }

  let addressFields = [
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

  return (
    <div>
      <Form
        onSubmit={async () => {
          const attributes = {
            name: data.name,
            type: data.type
          };

          if (data.phoneNumber) {
            attributes.phones = [{ number: data.phoneNumber }];
          }

          if (data.email) {
            attributes.emails = [{ address: data.email }];
          }

          if (data.address || data.city || data.state || data.zipcode) {
            attributes.addresses = [{
              lineOne: data.address,
              city: data.city,
              stateId: data.state,
              zipcode: data.zipcode
            }];
          }

          const response = await submitQuery(createFirm, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createFirm.errors;
            const resource = response.createFirm.resource;
            if (errors && Object.keys(errors).length) onError();
            if (resource) setFirms((firms) => [...firms, resource]);
          }
        }}
        submitText="Create Firm"
      >
        {children}
        <TextField
          name="name"
          label="Name"
          onChange={handleChange}
          required
        />
        <FormControl variant="outlined">
          <InputLabel>Type</InputLabel>
          <Select
            value={data.type}
            onChange={(e, value) => handleChange("type", value.props.value)}
            label="type"
          >
            <MenuItem value={"Agency"}>Agency</MenuItem>
            <MenuItem value={"AdvisoryPractice"}>Advisory Practice</MenuItem>
            <MenuItem value={"IMO"}>IMO</MenuItem>
            <MenuItem value={"NMO"}>NMO</MenuItem>
            <MenuItem value={"CMO"}>CMO</MenuItem>
            <MenuItem value={"BGA"}>BGA</MenuItem>
            <MenuItem value={"MGA"}>MGA</MenuItem>
            <MenuItem value={"BrokerDealer"}>Broker Dealer</MenuItem>
            <MenuItem value={"RIA"}>RIA</MenuItem>
            <MenuItem value={"BranchOffice"}>Branch Office</MenuItem>
            <MenuItem value={"Division"}>Division</MenuItem>
            <MenuItem value={"NationalAccount"}>National Account</MenuItem>
            <MenuItem value={"Wirehouse"}>Wirehouse</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="phoneNumber"
          label="Phone Number"
          onChange={handleChange}
        />
        <TextField name="email" label="Email" onChange={handleChange} />
        <InlineFields fields={addressFields} />
      </Form>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Link</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Phone #</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {firms.length ? (
              firms.map((firm) => (
                <TableRow key={firm.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/firms/${firm.id}`}
                    >
                      {firm.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {firm.type}
                  </TableCell>
                  <TableCell>
                    {!!firm.phones.length && firm.phones[0].number}
                  </TableCell>
                  <TableCell>
                    {!!firm.emails.length && firm.emails[0].address}
                  </TableCell>
                  <TableCell>
                    {!!firm.addresses.length &&
                      [firm.addresses[0].lineOne,
                       firm.addresses[0].lineTwo,
                       firm.addresses[0].city,
                       firm.addresses[0].state?.name,
                       firm.addresses[0].zipcode
                     ].filter(el => el).join(", ")
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  No firms
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
