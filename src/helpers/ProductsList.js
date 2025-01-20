const fetchProducts = `
  query productsList($type: Int, $carrierId: String) {
    products(type: $type, carrierId: $carrierId) {
      nodes {
        id
        name
        carrierId
        productType {
          id
          name
        }
      }
    }
  }
  `;


export default async function ProductsList(submitQuery, apiKey, type, carrierId) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchProducts, {
        variables: {type: type, carrierId: carrierId}
      });
      return result.products.nodes || []
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
