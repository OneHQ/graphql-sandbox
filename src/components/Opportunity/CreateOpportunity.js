/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
} from "@material-ui/core";
import Form from "../../Form";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from "../../TextField";
import InlineFields from "../../InlineFields";
import OptionsList from "../../helpers/OptionsList";
import ProductTypesList from "../../helpers/ProductTypesList";
import SearchQuery from "../../helpers/SearchQuery";
import { GraphqlContext } from "../../App";
import debounce from 'lodash/debounce';

const createOpportunity = `
  mutation CreateOpportunity($attributes: OpportunityInput!) {
    createOpportunity(attributes: $attributes) {
      errors
      resource {
        id
        name
        amount
        opportunityStatus
        productType {
          id
          name
        }
        opportunityType
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
  }
`;

const policyHolderTypeGroups = {
  "Annuity": ["Annuitant", "Joint Annuitant"],
  "Life": ["Insured", "Additional Insured"],
  "Disability": ["Insured", "Additional Insured"],
  "Long Term Care": ["Insured", "Both Insured", "One Insured"],
  "Linked Benefit": ["Insured", "Additional Insured"],
  "Health": ["Individual", "Dependent"],
  "Senior": ["Insured"],
  "Life Settlement": ["Insured"],
  "Group": ["Individual", "Dependent", "Individual + Family", "Individual + Children", "Individual + Spouse"],
  "Property & Casualty": []
}


export default function CreateOpportunity({ children, onError, submitQuery }) {
  const context = React.useContext(GraphqlContext);
  const [opportunities, setOpportunities] = useState([]);
  const [data, setData] = useState({opportunityStatus: "Open", opportunityType: "Quote", policyHolderType: ""});
  const [options, setOptions] = useState({
    policyHolder: false,
    policyHolderConType: "Client",
    recommendation: false,
    recommendationOwnerType: "Carrier",
    writingAdvisor: false,
  });
  const [productTypesList, setProductTypesList] = useState([]);
  const [opportunityStatusList, setOpportunityStatusList] = useState([]);
  const [opportunityTypeList, setOpportunityTypeList] = useState([]);
  const [policyHolderTypeList, setPolicyHolderTypeList] = useState([]);
  const [filteredPolicyHolderTypes, setFilteredPolicyHolderTypes] = useState([]);

  const [policyHolderConList, setPolicyHolderConList] = useState([]);

  const [recommendationOwnerList, setRecommendationOwnerList] = useState([]);

  const [advisorsList, setAdvisorsList] = useState([]);

  const url = context.graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  const debounceFetch = useCallback(
    debounce((fetchData, value, resource) => fetchData(value, resource), 500),
    [],
  );

  useEffect(() => {
    async function fetchData(){
      let result = await ProductTypesList(submitQuery, context.apiKey);
      result = result.filter(el => el.productClassId === 1)
      setProductTypesList(result);

      result = await OptionsList(submitQuery, context.apiKey, "OpportunityStatus");
      setOpportunityStatusList(result);

      result = await OptionsList(submitQuery, context.apiKey, "OpportunityType");
      setOpportunityTypeList(result);

      result = await OptionsList(submitQuery, context.apiKey, "PolicyHolderType");
      setPolicyHolderTypeList(result);
    }

    debounceFetch(fetchData);

  }, [context.apiKey]);

  useEffect(() => {
    const productTypeName = productTypesList.filter(el => el.id === data.productType)[0]?.name;
    const result = policyHolderTypeList.filter(item => policyHolderTypeGroups[productTypeName].indexOf(item.name) !== -1);
    setFilteredPolicyHolderTypes(result);
  }, [data.productType]);

  async function handleKeyPressChange(value, resource) {
    const results =  await SearchQuery(submitQuery, context.apiKey, value, [resource]);
    if (resource === "Advisor") {
      setAdvisorsList(results.results ? results.results : []);
    }
    else if (["Client", "Company"].indexOf(resource) !== -1) {
      setPolicyHolderConList(results.results ? results.results : []);
    }
    else if (["Carrier", "Vendor"].indexOf(resource) !== -1) {
      setRecommendationOwnerList(results.results ? results.results : []);
    }
  }

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }


  const handleOptionsChange = (name, value) => {
    setOptions((d) => ({ ...d, [name]: value }));

    if (name === "policyHolderConType")
      setPolicyHolderConList([]);
    else if (name === "recommendationOwnerType")
      setRecommendationOwnerList([]);
  }

  const inlineOpportunity = [
    { field:
      <TextField
        name="amount"
        label="amount"
        onChange={handleChange}
        required
        type="number"
        fullWidth
      />,
      width: "50%"
    },
    {
      field: (
        <Autocomplete
          options={productTypesList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="productType"
          onChange={(e, value) => handleChange("productType", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product Type"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={() => {}}
              required
            />
          )}
        />
      ),
      width: "50%",
      marginLeft: "1%"
    },
    { field: opportunityStatusList.length ? (
        <>
          <FormControl variant="outlined" fullWidth>
          <InputLabel>Opportunity Status</InputLabel>
          <Select
          value={data.opportunityStatus}
          onChange={(e, value) => handleChange("opportunityStatus", value.props.value)}
          label="Opportunity Status"
          name= "opportunityStatus"
          required
          >
          {opportunityStatusList.map(item => (
            <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
          ))}
          </Select>
          </FormControl>
        </>
      ) : null,
      width: "50%"
    },
    { field: opportunityTypeList.length ? (
        <>
          <FormControl variant="outlined" fullWidth>
          <InputLabel>Opportunity Type</InputLabel>
          <Select
          value={data.opportunityType}
          onChange={(e, value) => handleChange("opportunityType", value.props.value)}
          label="Opportunity Type"
          name= "opportunityType"
          >
          {opportunityTypeList.map(item => (
            <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
          ))}
          </Select>
          </FormControl>
        </>
      ) : null,
      width: "50%",
      marginLeft: "1%"
    },
  ];

  const inlinePolicyHolder = [
    {
      field: (
        <>
          <FormControl variant="outlined" fullWidth>
          <InputLabel>Connection Type</InputLabel>
          <Select
          value={options.policyHolderConType}
          onChange={(e, value) => handleOptionsChange("policyHolderConType", value.props.value)}
          label="Connection Type"
          name= "policyHolderConType"
          >
          <MenuItem value={"Client"}>Client</MenuItem>
          <MenuItem value={"Company"}>Company</MenuItem>
          </Select>
          </FormControl>
        </>
      ),
      width: "40%"
    },
    {
      field: (
        <Autocomplete
          options={policyHolderConList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="policyHolderConnection"
          onChange={(e, value) => handleChange("policyHolderConnection", value ? value.id : null)}
          noOptionsText = ""
          renderInput={(params) => (
            <TextField
              {...params}
              label={`Find ${options.policyHolderConType}`}
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={(e, value) => debounceFetch(handleKeyPressChange, value, options.policyHolderConType)}
              required
            />
          )}
        />
      ),
      width: "60%",
      marginLeft: "1%"
    }
  ];

  const inlineRecommendation = [
    {
      field: (
        <>
          <FormControl variant="outlined" fullWidth>
          <InputLabel>Owner Type</InputLabel>
          <Select
          value={options.recommendationOwnerType}
          onChange={(e, value) => handleOptionsChange("recommendationOwnerType", value.props.value)}
          label="Owner Type"
          name= "recommendationOwnerType"
          >
          <MenuItem value={"Carrier"}>Carrier</MenuItem>
          <MenuItem value={"Vendor"}>Vendor</MenuItem>
          </Select>
          </FormControl>
        </>
      ),
      width: "40%"
    },
    {
      field: (
        <Autocomplete
          options={recommendationOwnerList}
          autoHighlight
          getOptionLabel={(option) => option.name}
          renderOption={(option) => option.name}
          name="recommendationOwner"
          noOptionsText = ""
          onChange={(e, value) => handleChange("recommendationOwner", value ? value.id : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`Find ${options.recommendationOwnerType}`}
              variant="outlined"
              inputProps={{
                ...params.inputProps,
              }}
              onChange={(e, value) => debounceFetch(handleKeyPressChange, value, options.recommendationOwnerType)}
              required
            />
          )}
        />
      ),
      width: "60%",
      marginLeft: "1%"
    },
    {
      field: (
        <TextField
          name="recAmount"
          label="Amount"
          onChange={handleChange}
          type="number"
          fullWidth
          required
        />
      ),
      width: "25%"
    },
    {
      field: (
        <TextField
          name="recScenarioCount"
          label="Scenario Count"
          onChange={handleChange}
          type="number"
          fullWidth
          required
        />
      ),
      width: "25%",
      marginLeft: "1%"
    },
    {
      field: (
        <TextField
          name="recModalFactorPercent"
          label="Modal Factor Percent"
          onChange={handleChange}
          type="number"
          fullWidth
          InputProps={{ inputProps: {  max: 100 } }}
        />
      ),
      width: "25%",
      marginLeft: "1%"
    },
    {
      field: (
        <TextField
          name="recModalPremium"
          label="Modal Premium"
          onChange={handleChange}
          type="number"
          fullWidth
        />
      ),
      width: "25%",
      marginLeft: "1%"
    },
    {
      field: (
        <TextField
          name="recNumber"
          label="number"
          onChange={handleChange}
          type="number"
          fullWidth
        />
      ),
      width: "25%"
    }
  ];

  return (
    <div>
      <Form
        onSubmit={async () => {
          const attributes = {
            name: data.name,
            amount: parseFloat(data.amount),
            productTypeId: data.productType,
            opportunityStatus: data.opportunityStatus,
            opportunityType: data.opportunityType,
          };

          if (options.policyHolder && data.policyHolderConnection) {
            if (options.policyHolderConType === "Client") {
              attributes.policyHolders = [
                {
                  clientId: data.policyHolderConnection,
                  isPrimary: true,
                  isPayor: true
                }
              ];
            }
            else {
              attributes.policyHolders = [
                {
                  companyId: data.policyHolderConnection,
                  isPrimary: true,
                  isPayor: true
                }
              ];
            }

            if (data.policyHolderType)
              attributes.policyHolders[0].policyHolderTypeId = data.policyHolderType
          }

          if (options.recommendation && data.recommendationOwner) {
            if (options.recommendationOwnerType === "Carrier") {
              attributes.recommendations = [
                {
                  carrierId: data.recommendationOwner,
                  isPrimary: true
                }
              ];
            }
            else {
              attributes.recommendations = [
                {
                  vendorId: data.recommendationOwner,
                  isPrimary: true
                }
              ];
            }

            if(data.recAmount)
              attributes.recommendations[0].amount = parseFloat(data.recAmount);
            if(data.recModalFactorPercent)
              attributes.recommendations[0].modalFactorPercent = parseFloat(data.recModalFactorPercent);
            if(data.recModalPremium)
              attributes.recommendations[0].modalPremium = parseFloat(data.recModalPremium);
            if(data.recScenarioCount)
              attributes.recommendations[0].scenarioCount = parseInt(data.recScenarioCount);
            if(data.recNumber)
              attributes.recommendations[0].number = data.recNumber;
          }

          if (options.writingAdvisor && data.writingAdvisor) {
            attributes.writingAdvisors = [
              {
                advisorId: data.writingAdvisor,
                isPrimary: true
              }
            ];

          }

          const response = await submitQuery(createOpportunity, {
            variables: {
              attributes
            }
          });
          if (response) {
            const errors = response.createOpportunity.errors;
            const resource = response.createOpportunity.resource;
            if (errors && Object.keys(errors).length) onError(Object.values(errors).join("; "));
            if (resource) setOpportunities((opportunities) => [...opportunities, resource]);
          }
        }}
        submitText="Create Opportunity"
      >
        {children}
        <TextField
          name="name"
          label="name"
          onChange={handleChange}
          required
        />
        <InlineFields fields={inlineOpportunity}/>
        <FormControlLabel
          control={
            <Checkbox
              checked={options.policyHolder}
              onChange={() => handleOptionsChange("policyHolder", !options.policyHolder)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              label= "Add Policy Holder"
            />
          }
          label="Add Policy Holder"
        />
        {options.policyHolder && (
          <>
            <InlineFields fields={inlinePolicyHolder}/>
            <FormControl variant="outlined" fullWidth>
            <InputLabel>Policy Holder Type</InputLabel>
            <Select
            value={data.policyHolderType}
            defaultValue={""}
            onChange={(e, value) => handleChange("policyHolderType", value.props.value)}
            label="Policy Holder Type"
            name= "policyHolderType"
            >
            {filteredPolicyHolderTypes.map(item => (
              <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
            ))}
            </Select>
            </FormControl>
          </>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={options.recommendation}
              onChange={() => handleOptionsChange("recommendation", !options.recommendation)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              label= "Add Recommendation"
            />
          }
          label="Add Recommendation"
        />
        {options.recommendation && (
          <InlineFields fields={inlineRecommendation}/>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={options.writingAdvisor}
              onChange={() => handleOptionsChange("writingAdvisor", !options.writingAdvisor)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
              label= "Add Writing Advisor"
            />
          }
          label="Add Writing Advisor"
        />
        {options.writingAdvisor && (
          <Autocomplete
            options={advisorsList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            renderOption={(option) => option.name}
            name="writingAdvisor"
            noOptionsText = ""
            onChange={(e, value) => handleChange("writingAdvisor", value ? value.id : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Find Writing Advisor"
                variant="outlined"
                inputProps={{
                  ...params.inputProps,
                }}
                onChange={(e, value) => debounceFetch(handleKeyPressChange, value, "Advisor")}
                required
              />
            )}
          />
        )}
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
