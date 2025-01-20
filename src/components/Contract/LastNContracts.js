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

const fetchContracts = `
  query LastNContracts($first: Int!) {
    contracts(first: $first) {
      nodes {
        id
        name
        carrier {
          id
          name
        }
        advisor {
          id
          name
        }
        productTypes {
          id
          name
        }
      }
    }
  }
`;

export default function LastNContracts({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [contracts, setContracts] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchContracts, {
            variables: { first: parseInt(data.limit, 10) }
          });
          if (response) setContracts(response.contracts.nodes);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} contracts`
            : "Query contracts"
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
              <TableCell>Advisor</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>Product Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length ? (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/contracts/${contract.id}`}
                    >
                      {contract.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {contract.advisor.name}
                  </TableCell>
                  <TableCell>
                    {contract.carrier.name}
                  </TableCell>
                  <TableCell>
                    {contract.productTypes.map((p) => p.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  No contracts
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
