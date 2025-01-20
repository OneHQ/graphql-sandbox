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

const fetchFirms = `
  query LastNFirms($first: Int!) {
    firms(first: $first) {
      nodes {
        id
        name
        type
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

export default function LastNFirms({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [firms, setFirms] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchFirms, {
            variables: { first: parseInt(data.limit, 10) }
          });
          if (response) setFirms(response.firms.nodes);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} firms`
            : "Query firms"
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
                    {firm.phones.map((p) => p.number).join(", ")}
                  </TableCell>
                  <TableCell>
                    {firm.emails.map((p) => p.address).join(", ")}
                  </TableCell>
                  <TableCell>
                    {firm.addresses.map((p) =>
                      <p key={`add${p.id}`}>{[p.lineOne, p.lineTwo, p.city, p.state?.name, p.zipcode].filter(el => el).join(", ")}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={7} style={{ textAlign: "center" }}>
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
