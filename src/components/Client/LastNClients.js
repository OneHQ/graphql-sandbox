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
import { GraphqlContext } from "../../App"

const fetchClients = `
  query LastNClients($first: Int!) {
    clients(first: $first) {
      nodes {
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

export default function LastNClients({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [clients, setClients] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"


  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchClients, {
            variables: { first: parseInt(data.limit, 10) }
          });
          if (response) setClients(response.clients.nodes);
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
              <TableRow key="defaultRow">
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
