const fetchOptions = (type) => (
  `
  query optionsList {
    options(type: "${type}") {
      id
      name
    }
  }
  `
)


export default async function OptionsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchOptions(type), {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
