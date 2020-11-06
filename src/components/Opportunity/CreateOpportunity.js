/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
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
import AdvisorsList from "../../helpers/AdvisorsList"
import CarriersList from "../../helpers/CarriersList"
import ClientsList from "../../helpers/ClientsList"
import CompaniesList from "../../helpers/CompaniesList"
import OptionsList from "../../helpers/OptionsList"
import ProductTypesList from "../../helpers/ProductTypesList"
import VendorsList from "../../helpers/VendorsList"

const createOpportunity = `
  mutation CreateOpportunity($attributes: OpportunityInput!) {
    createOpportunity(attributes: $attributes) {
      errors
      resource {
        id
        amount
        name
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


export default function CreateOpportunity({ children, onError, submitQuery, apiKey, graphqlURL }) {
  const [opportunities, setOpportunities] = useState([]);
  const [data, setData] = useState({opportunityStatus: "Open", opportunityType: "OpportunityType::::Quote", policyHolderType: ""});
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

  const [clientsList, setClientsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [policyHolderConList, setPolicyHolderConList] = useState([]);

  const [carriersList, setCarriersList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [recommendationOwnerList, setRecommendationOwnerList] = useState([]);

  const [advisorsList, setAdvisorsList] = useState([]);

  const url = graphqlURL === "staging" ? "https://agencieshq-staging.agencieshq.com"  : "https://agencieshq.com"

  useEffect(() => {
    async function fetchData(){
      let result = await ProductTypesList(submitQuery, apiKey);
      result = result && result.productTypes ? result.productTypes.filter(el => el.productClassId === 1) : []
      setProductTypesList(result);

      result = await OptionsList(submitQuery, apiKey, "OpportunityStatus");
      setOpportunityStatusList(result && result.options ? result.options : []);

      result = await OptionsList(submitQuery, apiKey, "OpportunityType");
      setOpportunityTypeList(result && result.options ? result.options : []);

      result = await OptionsList(submitQuery, apiKey, "PolicyHolderType");
      setPolicyHolderTypeList(result && result.options ? result.options : []);

      result = await AdvisorsList(submitQuery, apiKey);
      setAdvisorsList(result && result.advisors ? result.advisors : [])

      result = await ClientsList(submitQuery, apiKey);
      setClientsList(result && result.clients ? result.clients : [])

      result = await CompaniesList(submitQuery, apiKey);
      setCompaniesList(result && result.companies ? result.companies : []);

      result = await CarriersList(submitQuery, apiKey);
      setCarriersList(result && result.carriers ? result.carriers : []);

      result = await VendorsList(submitQuery, apiKey);
      setVendorsList(result && result.vendors ? result.vendors : []);
    }

    fetchData();

  }, [apiKey]);

  useEffect(() => {
    setRecommendationOwnerList(options.recommendationOwnerType === "Carrier" ? carriersList : vendorsList);
  }, [options.recommendationOwnerType, carriersList, vendorsList]);

  useEffect(() => {
    setPolicyHolderConList(options.policyHolderConType === "Client" ? clientsList : companiesList);
  }, [options.policyHolderConType, clientsList, companiesList]);

  useEffect(() => {
    const productTypeName = productTypesList.filter(el => el.id === data.productType)[0]?.name;
    const result = policyHolderTypeList.filter(item => policyHolderTypeGroups[productTypeName].indexOf(item.name) !== -1);
    setFilteredPolicyHolderTypes(result);
  }, [data.productType]);

  const handleChange = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
  }

  const handleOptionsChange = (name, value) => {
    setOptions((d) => ({ ...d, [name]: value }));
  }

  const inlineOpportunityOne = [
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
    }
  ]

  if (productTypesList.length)
    inlineOpportunityOne.push({
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
    });

    const inlineOpportunityTwo = [
      { field: opportunityStatusList.length ? (
          <>
            <FormControl variant="outlined" fullWidth>
            <InputLabel>Opportunity Status</InputLabel>
            <Select
            value={data.opportunityStatus}
            onChange={(e, value) => handleChange("opportunityStatus", value.props.value)}
            label="Opportunity Status"
            name= "opportunityStatus"
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
              <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
            ))}
            </Select>
            </FormControl>
          </>
        ) : null,
        width: "50%",
        marginLeft: "1%"
      },
    ];

    const inlinePolicyHolder = [{
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
    }];

    if (policyHolderConList.length)
      inlinePolicyHolder.push({
        field: (
          <Autocomplete
            options={policyHolderConList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            renderOption={(option) => option.name}
            name="policyHolderConnection"
            onChange={(e, value) => handleChange("policyHolderConnection", value ? value.id : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={options.policyHolderConType}
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
        width: "60%",
        marginLeft: "1%"
      })

    const inlineRecommendationOne = [{
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
    }];

    if (recommendationOwnerList.length)
      inlineRecommendationOne.push({
        field: (
          <Autocomplete
            options={recommendationOwnerList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            renderOption={(option) => option.name}
            name="recommendationOwner"
            onChange={(e, value) => handleChange("recommendationOwner", value ? value.id : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={options.recommendationOwnerType}
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
        width: "60%",
        marginLeft: "1%"
      })

      const inlineRecommendationTwo = [
        {
          field: (
            <TextField
              name="recAmount"
              label="Amount"
              onChange={handleChange}
              type="number"
              fullWidth
            />
          ),
          width: "25%"
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
              name="recScenarioCount"
              label="Scenario Count"
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
          width: "25%",
          marginLeft: "1%"
        }
      ]

  return (
    <div>
      <Form
        onSubmit={async () => {
          const attributes = {
            name: data.name,
            amount: parseFloat(data.amount),
            productTypeId: data.productType,
            opportunityStatus: data.opportunityStatus,
            opportunityTypeId: data.opportunityType,
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
            if (errors && Object.keys(errors).length) onError();
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
        <InlineFields fields={inlineOpportunityOne}/>
        <InlineFields fields={inlineOpportunityTwo}/>
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
        {options.policyHolder && policyHolderTypeList.length  > 0 && (
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
        {options.recommendation && (carriersList.length + vendorsList.length)  > 0 && (
          <>
            <InlineFields fields={inlineRecommendationOne}/>
            <InlineFields fields={inlineRecommendationTwo}/>
          </>
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
        {options.writingAdvisor && advisorsList.length > 0 && (
          <Autocomplete
            options={advisorsList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            renderOption={(option) => option.name}
            name="writingAdvisor"
            onChange={(e, value) => handleChange("writingAdvisor", value ? value.id : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Writing Advisor"
                variant="outlined"
                inputProps={{
                  ...params.inputProps,
                }}
                onChange={() => {}}
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
                <TableCell colSpan={4} style={{ textAlign: "center" }}>
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
