const fetchStates = `
  query statesList {
    states {
      nodes {
        id
        name
        abbreviation
      }
    }
  }
`;


export default async function StatesList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchStates, {});
      return result.states.nodes
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
