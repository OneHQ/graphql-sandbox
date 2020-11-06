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

const fetchClients = `
  query LastNClients($limit: Int!) {
    clients(limit: $limit) {
      id
      addresses {
        id
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
`;

export default function LastNClients({ children, submitQuery, graphqlURL }) {
  const [clients, setClients] = useState([]);
  const [data, setData] = useState({});

  const url = graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"


  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchClients, {
            variables: { limit: parseInt(data.limit, 10) }
          });
          if (response) setClients(response.clients);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} clients`
            : "Query clients"
        }
      >
        {children}
        <TextField
          name="limit"
          label="Limit"
          onChange={handleChange}
          required
          type="number"
        />
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
                    {client.phones.map((p) => p.number).join(", ")}
                  </TableCell>
                  <TableCell>
                    {client.emails.map((p) => p.address).join(", ")}
                  </TableCell>
                  <TableCell>
                    {client.addresses.map((p) =>
                      <p key={`add${p.id}`}>{[p.lineOne, p.lineTwo, p.city, p.state?.name, p.zipcode].filter(el => el).join(", ")}</p>)
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
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
