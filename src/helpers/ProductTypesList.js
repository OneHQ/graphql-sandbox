const fetchStates = `
  query productTypesList {
    productTypes {
      id
      name
      productClassId
    }
  }
`;


export default async function StatesList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchStates, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
