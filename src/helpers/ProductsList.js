const fetchProducts = `
  query productsList($type: String) {
    products(type: $type) {
      id
      name
      carrierId
      productType {
        id
        name
      }
    }
  }
  `;


export default async function ProductsList(submitQuery, apiKey, type) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchProducts, {variables: {type: type}});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
