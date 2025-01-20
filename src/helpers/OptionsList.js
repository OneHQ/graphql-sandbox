const fetchOptions = (type) => (
  `
  query optionsList {
    options(type: "${type}") {
      nodes {
        id
        name
      }
    }
  }
  `
)


export default async function OptionsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchOptions(type), {});
      return result.options?.nodes || []
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
