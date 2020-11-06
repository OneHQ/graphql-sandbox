const fetchClients = `
  query clientsList {
    clients {
      id
      name
    }
  }
`;


export default async function ClientsList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchClients, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
