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

const fetchOpportunities = `
  query LastNOpportunities($limit: Int!) {
    opportunities(limit: $limit) {
      id
      name
      amount
      opportunityStatus
      productType {
        id
        name
      }
      opportunityType {
        id
        name
      }
      policyHolders {
        id
        client {
          id
          name
        }
        company {
          id
          name
        }
      }
      writingAdvisors {
        id
        advisor {
          id
          name
        }
      }
      recommendations {
        id
        amount
        modalFactorPercent
        modalPremium
        scenarioCount
        number
        owner {
          ... on Carrier {
            id
            name
          }
          ... on Vendor {
            id
            name
          }
        }
      }
    }
  }
`;

export default function LastNOpportunities({ children, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [opportunities, setOpportunities] = useState([]);
  const [data, setData] = useState({});

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const handleChange = (name, value) =>
    setData((d) => ({ ...d, [name]: value }));

  return (
    <div>
      <Form
        onSubmit={async () => {
          const response = await submitQuery(fetchOpportunities, {
            variables: { limit: parseInt(data.limit, 10) }
          });
          if (response) setOpportunities(response.opportunities);
        }}
        submitText={
          data.limit
            ? `Query the last ${data.limit} opportunities`
            : "Query opportunities"
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
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Policy Holders</TableCell>
              <TableCell>Writing Advisors</TableCell>
              <TableCell>Recommendations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {opportunities.length ? (
              opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <Link
                      target="_blank"
                      href={`${url}/opportunities/${opportunity.id}`}
                    >
                      {opportunity.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                      {opportunity.opportunityStatus}
                  </TableCell>
                  <TableCell>
                      {opportunity.opportunityType?.name}
                  </TableCell>
                  <TableCell>
                      {opportunity.amount}
                  </TableCell>
                  <TableCell>
                    {opportunity.productType.name}
                  </TableCell>
                  <TableCell>
                    {
                      opportunity.policyHolders.map((p) => p.client?.name ? p.client.name : (p.company?.name ? p.company.name : null))
                      .filter((p) => p)
                      .join(", ")
                    }
                  </TableCell>
                  <TableCell>
                    {opportunity.writingAdvisors.map((p) => p.advisor.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    {opportunity.recommendations.map((p) =>
                      <>
                        <p key={`opp${p.id}`}><b>{p.owner.name}</b></p>
                        <p key={`opp${p.id}`}>{[
                          p.amount ? `amount: ${p.amount}` : null,
                          p.modalFactorPercent ? `modal factor perc.: ${p.modalFactorPercent}%` : null,
                          p.modalPremium ? `modal premium: ${p.modalPremium}` : null,
                          p.scenarioCount ? `scenario count: ${p.scenarioCount}` : null,
                          p.number ? `number: ${p.number}` : null
                        ].filter(el => el).join(", ")}</p>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="defaultRow">
                <TableCell colSpan={8} style={{ textAlign: "center" }}>
                  No opportunities
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
