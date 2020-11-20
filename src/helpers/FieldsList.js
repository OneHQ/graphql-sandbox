const fetchFields = `
  query fieldsList($type: String) {
    fields(type: $type) {
      id
      name
      style
      selectOptions {
        id
        name
      }
    }
  }
  `;


export default async function FieldsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchFields, {variables: {type: type}});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
