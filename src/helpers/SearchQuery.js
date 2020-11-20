const fetchSearch = `
  query Search($query: String!, $resources: [String!]!) {
    search(query: $query, resources: $resources) {
      results {
        id
        name
      }
    }
  }
  `;


export default async function SearchQuery(submitQuery, apiKey, query, resources) {
  if(apiKey) {
    try {
      const result = await submitQuery(fetchSearch, {variables: { query, resources }});
      return result.search
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
