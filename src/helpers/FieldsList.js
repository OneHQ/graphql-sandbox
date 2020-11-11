const fetchFields = (type) => (
  `
  query fieldsList {
    fields(type: "${type}") {
      id
      name
      style
      selectOptions {
        id
        name
      }
    }
  }
  `
)


export default async function FieldsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchFields(type), {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
