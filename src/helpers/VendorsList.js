const fetchVendors = `
  query vendorsList {
    vendors {
      id
      name
    }
  }
`;


export default async function VendorsList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchVendors, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
