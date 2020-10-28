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

const createClient = `
  mutation CreateClient($attributes: ClientInput!) {
    createClient(attributes: $attributes) {
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

export default function LastNClients({ children, onError, submitQuery }) {
  const [clients, setClients] = useState([]);
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
            {clients.length ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`https://www.agencieshq.com/clients/${client.id}`}
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
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
