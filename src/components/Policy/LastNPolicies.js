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
import { GraphqlContext } from "../../App";

const fetchPolicies = `
  query LastNPolicies($first: Int!) {
    policies(first: $first) {
      nodes {
        id
        name
        type
        policyNumber
        policyStatus
        signedDate
        advisors {
          id
          name
        }
        clients {
          id
          name
        }
        carrier {
          id
          name
        }
        productType {
          id
          name
        }
        product {
          id
          name
        }
        state {
          id
          name
          abbreviation
        }
      }
    }
  }
`;

export default function LastNPolicies({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [policies, setPolicies] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchPolicies, {
            variables: { first: parseInt(data.limit, 10) }
          });
          if (response) setPolicies(response.policies.nodes);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} policies`
            : "Query policies"
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
              <TableCell>type</TableCell>
              <TableCell>Policy Number</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Signed Date</TableCell>
              <TableCell>Advisors</TableCell>
              <TableCell>Clients</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.length ? (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/policies/${policy.id}`}
                    >
                      {policy.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {policy.type}
                  </TableCell>
                  <TableCell>
                    {policy.policyNumber}
                  </TableCell>
                  <TableCell>
                    {policy.productType.name}
                  </TableCell>
                  <TableCell>
                    {policy.product?.name}
                  </TableCell>
                  <TableCell>
                    {policy.carrier.name}
                  </TableCell>
                  <TableCell>
                    {policy.state.name}
                  </TableCell>
                  <TableCell>
                    {policy.policyStatus}
                  </TableCell>
                  <TableCell>
                    {policy.signedDate}
                  </TableCell>
                  <TableCell>
                    {policy.advisors.map((p) => p.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    {policy.clients.map((p) => p.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={11} style={{ textAlign: "center" }}>
                  No policies
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
