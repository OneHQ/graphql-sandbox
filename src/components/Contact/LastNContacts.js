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

const fetchContacts = `
  query LastNContacts($first: Int!) {
    contacts(first: $first) {
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
        phones {
          number
        }
      }
    }
  }
`;

export default function LastNContacts({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [contacts, setContacts] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchContacts, {
            variables: { first: parseInt(data.limit, 10) }
          });
          if (response) setContacts(response.contacts.nodes);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} contacts`
            : "Query contacts"
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
            {contacts.length ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/contacts/${contact.id}`}
                    >
                      {contact.demographic.firstName}{" "}
                      {contact.demographic.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.demographic.firstName}</TableCell>
                  <TableCell>{contact.demographic.lastName}</TableCell>
                  <TableCell>
                    {contact.phones.map((p) => p.number).join(", ")}
                  </TableCell>
                  <TableCell>
                    {contact.emails.map((p) => p.address).join(", ")}
                  </TableCell>
                  <TableCell>
                    {contact.addresses.map((p) =>
                      <p key={`add${p.id}`}>{[p.lineOne, p.lineTwo, p.city, p.state?.name, p.zipcode].filter(el => el).join(", ")}</p>)
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
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
