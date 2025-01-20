const fetchStates = `
  query productTypesList {
    productTypes {
      nodes {
        id
        name
        productClassId
      }
    }
  }
`;


export default async function ProductTypesList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchStates, {});
      return result.productTypes.nodes || []
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
