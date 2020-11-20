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

const fetchAdvisors = `
  query LastNAdvisors($limit: Int!) {
    advisors(limit: $limit) {
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
`;

export default function LastNAdvisors({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [advisors, setAdvisors] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchAdvisors, {
            variables: { limit: parseInt(data.limit, 10) }
          });
          if (response) setAdvisors(response.advisors);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} advisors`
            : "Query advisors"
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
            {advisors.length ? (
              advisors.map((advisor) => (
                <TableRow key={advisor.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/advisors/${advisor.id}`}
                    >
                      {advisor.demographic.firstName}{" "}
                      {advisor.demographic.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{advisor.demographic.firstName}</TableCell>
                  <TableCell>{advisor.demographic.lastName}</TableCell>
                  <TableCell>
                    {advisor.phones.map((p) => p.number).join(", ")}
                  </TableCell>
                  <TableCell>
                    {advisor.emails.map((p) => p.address).join(", ")}
                  </TableCell>
                  <TableCell>
                    {advisor.addresses.map((p) =>
                      <p key={`add${p.id}`}>{[p.lineOne, p.lineTwo, p.city, p.state?.name, p.zipcode].filter(el => el).join(", ")}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {!!advisor.fieldAttributes.length && advisor.fieldAttributes.map((field) => {
                      if (field.field.style !== "checkbox")
                        return  <p key={`adv${field.id}`}>
                                  <b>{field.field.name}:</b> {field.value === "true" ? "Yes" : (field.value === "false" ? "No" : field.value)}
                                </p>
                      else
                        return  field.value === "true" ?
                                <p key={`adv${field.id}`}>
                                  <b>{field.field.name}</b>
                                </p> : null
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={7} style={{ textAlign: "center" }}>
                  No advisors
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
