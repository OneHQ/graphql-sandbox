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
import Form from "../../Form";
import InlineFields from "../../InlineFields";
import TextField from "../../TextField";
import addressFieldsArray from "../../helpers/addressFieldsArray";
import StatesList from "../../helpers/StatesList";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

const createContact = `
  mutation CreateContact($attributes: ContactInput!) {
    createContact(attributes: $attributes) {
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

export default function CreateContact({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [contacts, setContacts] = useState([]);
  const [data, setData] = useState({});
  const [statesList, setStatesList] = useState([]);

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData) => fetchData(), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      const result = await StatesList(submitQuery, context.apiKey);
      setStatesList(result)
    }

    debounceFetch(fetchData);

  }, [context.apiKey]);

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

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

          const response = await submitQuery(createContact, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createContact.errors;
            const resource = response.createContact.resource;
            if (errors && Object.keys(errors).length) onError(Object.values(errors).join("; "));
            if (resource) setContacts((contacts) => [...contacts, resource]);
          }
        }}
        submitText="Create Contact"
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
            {contacts.length ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/${contact.id}`}
                    >
                      {contact.demographic.firstName}{" "}
                      {contact.demographic.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.demographic.firstName}</TableCell>
                  <TableCell>{contact.demographic.lastName}</TableCell>
                  <TableCell>
                    {!!contact.phones.length && contact.phones[0].number}
                  </TableCell>
                  <TableCell>
                    {!!contact.emails.length && contact.emails[0].address}
                  </TableCell>
                  <TableCell>
                    {!!contact.addresses.length &&
                      [contact.addresses[0].lineOne,
                       contact.addresses[0].lineTwo,
                       contact.addresses[0].city,
                       contact.addresses[0].state?.name,
                       contact.addresses[0].zipcode
                     ].filter(el => el).join(", ")
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  No contacts
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
