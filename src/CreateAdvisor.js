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
import Form from "./Form";
import TextField from "./TextField";

const createAdvisor = `
  mutation CreateAdvisor($attributes: AdvisorInput!) {
    createAdvisor(attributes: $attributes) {
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

export default function LastNAdvisors({ children, onError, submitQuery }) {
  const [advisors, setAdvisors] = useState([]);
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
          const response = await submitQuery(createAdvisor, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createAdvisor.errors;
            const resource = response.createAdvisor.resource;
            if (errors && Object.keys(errors).length) onError();
            if (resource) setAdvisors((advisors) => [...advisors, resource]);
          }
        }}
        submitText="Create Advisor"
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
            {advisors.length ? (
              advisors.map((advisor) => (
                <TableRow key={advisor.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`https://www.agencieshq.com/advisors/${advisor.id}`}
                    >
                      {advisor.demographic.firstName}{" "}
                      {advisor.demographic.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{advisor.demographic.firstName}</TableCell>
                  <TableCell>{advisor.demographic.lastName}</TableCell>
                  <TableCell>
                    {!!advisor.phones.length && advisor.phones[0].number}
                  </TableCell>
                  <TableCell>
                    {!!advisor.emails.length && advisor.emails[0].address}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
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
