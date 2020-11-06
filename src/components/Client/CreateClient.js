/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Link,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
} from "@material-ui/core";
import Form from "../../Form";
import Autocomplete from '@material-ui/lab/Autocomplete';
import InlineFields from "../../InlineFields";
import TextField from "../../TextField";
import StatesList from "../../helpers/StatesList"

const createClient = `
  mutation CreateClient($attributes: ClientInput!) {
    createClient(attributes: $attributes) {
      errors
      resource {
        id
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
        demographic {
          firstName
          lastName
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

export default function CreateClient({ children, onError, submitQuery, apiKey, graphqlURL }) {
  const [clients, setClients] = useState([]);
  const [data, setData] = useState({});
  const [statesList, setStatesList] = useState([]);

  const url = graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  useEffect(() => {
    async function fetchStates(){
      const result = await StatesList(submitQuery, apiKey);
      setStatesList(result && result.states ? result.states : [])
    }

    fetchStates();

  }, [apiKey]);

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  let addressFields = [
    {
      field: <TextField name="address" label="Address" onChange={handleChange} fullWidth/>,
      width: "50%"
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

  if (statesList.length)
    addressFields.splice(1 , 0,
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
              />
            )}
          />
        ),
        width: "20%",
        marginLeft: "1%"
      }
    ).join();

  return (
    <div>
      <Form
        onSubmit={async () => {
          const attributes = {
            demographic: {
              firstName: data.firstName,
              lastName: data.lastName
            }
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

          const response = await submitQuery(createClient, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createClient.errors;
            const resource = response.createClient.resource;
            if (errors && Object.keys(errors).length) onError();
            if (resource) setClients((clients) => [...clients, resource]);
          }
        }}
        submitText="Create Client"
      >
        {children}
        <TextField
          name="firstName"
          label="First Name"
          onChange={handleChange}
          required
        />
        <TextField
          name="lastName"
          label="Last Name"
          onChange={handleChange}
          required
        />
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
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Phone #</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/clients/${client.id}`}
                    >
                      {client.demographic.firstName}{" "}
                      {client.demographic.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{client.demographic.firstName}</TableCell>
                  <TableCell>{client.demographic.lastName}</TableCell>
                  <TableCell>
                    {!!client.phones.length && client.phones[0].number}
                  </TableCell>
                  <TableCell>
                    {!!client.emails.length && client.emails[0].address}
                  </TableCell>
                  <TableCell>
                    {!!client.addresses.length &&
                      [client.addresses[0].lineOne,
                       client.addresses[0].lineTwo,
                       client.addresses[0].city,
                       client.addresses[0].state?.name,
                       client.addresses[0].zipcode
                     ].filter(el => el).join(", ")
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  No clients
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
