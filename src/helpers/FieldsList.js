const fetchFields = `
  query fieldsList($type: FieldKind) {
    fields(type: $type) {
      nodes {
        id
        name
        style
        selectOptions {
          id
          name
        }
      }
    }
  }
  `;


export default async function FieldsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchFields, {variables: {type: type}});
      return result.fields?.nodes || []
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
