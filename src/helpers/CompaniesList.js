const fetchCompanies = `
  query companiesList {
    companies {
      id
      name
    }
  }
`;


export default async function CompaniesList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchCompanies, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
