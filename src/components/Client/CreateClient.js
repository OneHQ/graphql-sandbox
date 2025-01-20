/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import {
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
} from "@material-ui/core";
import Form from "../../Form";
import InlineFields from "../../InlineFields";
import TextField from "../../TextField";
import FieldsList from "../../helpers/FieldsList";
import StatesList from "../../helpers/StatesList";
import addressFieldsArray from "../../helpers/addressFieldsArray";
import useFieldAttributesHook from "../../hooks/useFieldAttributesHook";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

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
        fieldAttributes {
          id
          value
          field {
            id
            name
            style
          }
        }
        phones {
          number
        }
      }
    }
  }
`;

export default function CreateClient({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [clients, setClients] = useState([]);
  const [data, setData] = useState({});
  const [dataFields, setDataFields] = useState({});

  const [fieldsList, setFieldsList] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [inlineFields, setInlineFields] = useState([]);

  const [statesList, setStatesList] = useState([]);

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData) => fetchData(), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      let result = await StatesList(submitQuery, context.apiKey);
      setStatesList(result)

      result = await FieldsList(submitQuery, context.apiKey, "Client");
      setFieldsList(result)
    }

    debounceFetch(fetchData);

    return () => {
      setStatesList([]);
      setFieldsList([]);
    }

  }, [context.apiKey]);


  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  const handleFieldChange = (name, value) => {
    setDataFields((d) => ({ ...d, [name]: value }));
  }

  const handleChangeMultiple = (event) => {
    const  options = event.target.value;
    setSelectedFields(options);
  };

  useFieldAttributesHook(dataFields, handleFieldChange, setInlineFields, selectedFields);

  let addressFields = addressFieldsArray(statesList, handleChange);

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

          const dataFieldsKeys = selectedFields.map(el => el.name);
          const auxFieldsListArray = Object.fromEntries(Object.entries(fieldsList).map(([key, value]) => [value.name, value]));
          if (dataFieldsKeys.length) {
            attributes.fieldAttributes = [];
            for (const key of dataFieldsKeys) {
              const item = auxFieldsListArray[key];
              attributes.fieldAttributes.push({
                fieldId: item.id,
                booleanValue: item.style === "checkbox" ? dataFields[key] : null,
                decimalValue: item.style === "decimal" ? parseFloat(dataFields[key]) : null,
                stringValue: ["checkbox", "decimal"].indexOf(item.style) === -1 ? dataFields[key] : null,
              })
            }
          }

          const response = await submitQuery(createClient, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createClient.errors;
            const resource = response.createClient.resource;
            if (errors && Object.keys(errors).length) onError(Object.values(errors).join("; "));
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
        {fieldsList.length > 0 &&
          <FormControl>
            <InputLabel>Add Fields</InputLabel>
            <Select
            multiple
            value={selectedFields}
            onChange={handleChangeMultiple}
            input={<Input />}
            renderValue={(selected) => selected.map(item => item.name).join(", ")}
            >
            {fieldsList.map((field) => (
              <MenuItem key={field.id} value={field}>
              <Checkbox checked={selectedFields.indexOf(field) > -1} />
              <ListItemText primary={field.name} />
              </MenuItem>
            ))}
            </Select>
          </FormControl>
        }
        {inlineFields.length > 0 && <InlineFields fields={inlineFields} />}
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
              <TableCell>Attributes</TableCell>
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
                  <TableCell>
                  {!!client.fieldAttributes.length && client.fieldAttributes.map((field) => {
                    if (field.field.style !== "checkbox")
                      return  <p key={`cli${field.id}`}>
                                <b>{field.field.name}:</b> {field.value === "true" ? "Yes" : (field.value === "false" ? "No" : field.value)}
                              </p>
                    else
                      return  field.value === "true" ?
                              <p key={`cli${field.id}`}>
                                <b>{field.field.name}</b>
                              </p> : null
                  })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: "center" }}>
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
