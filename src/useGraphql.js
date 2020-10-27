function graphql({ apiKey, query, variables, url }) {
  return fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ query, variables })
  });
}

export default function useGraphql({ apiKey, onError, url }) {
  return async (query, { variables } = {}) => {
    try {
      const { data, errors } = await graphql({
        apiKey,
        query,
        variables,
        url
      }).then(function (response) {
        if (!response.ok) {
          throw new Error(
            `Status Code: ${response.status}\n${response.statusText}`
          );
        }
        if (onError) onError();
        return response.json();
      });
      if (onError && errors?.length) {
        onError(errors.map((e) => e.message).join(", "));
      }
      return data;
    } catch (error) {
      if (onError) onError(error.message);
    }
  };
}
