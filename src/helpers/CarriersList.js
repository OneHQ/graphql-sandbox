const fetchCarriers = `
  query carriersList {
    carriers {
      id
      name
    }
  }
`;


export default async function CarriersList(submitQuery, apiKey) {

  if(apiKey) {
    try {
      const result = await submitQuery(fetchCarriers, {});
      return result
    } catch (error) {
      console.log(error);
    }
  }
  return []
}
