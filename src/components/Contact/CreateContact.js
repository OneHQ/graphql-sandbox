import React, { useState } from "react";
import {
  Link,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead
} from "@material-ui/core";
import Form from "../../Form";
import TextField from "../../TextField";

const createContact = `
  mutation CreateContact($attributes: ContactInput!) {
    createContact(attributes: $attributes) {
      errors
      resource {
        id
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

export default function LastNContacts({ children, onError, submitQuery }) {
  const [contacts, setContacts] = useState([]);
  const [data, setData] = useState({});

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

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
          const response = await submitQuery(createContact, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createContact.errors;
            const resource = response.createContact.resource;
            if (errors && Object.keys(errors).length) onError();
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
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.length ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`https://www.agencieshq.com/contacts/${contact.id}`}
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
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
