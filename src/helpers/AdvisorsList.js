const fetchAdvisors = `
  query advisorsList {
    advisors {
      id
      name
    }
  }
`;


export default async function AdvisorsList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchAdvisors, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
