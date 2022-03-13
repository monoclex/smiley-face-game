import type { ParsableSchemaInput, SchemaInput } from "./computed-types-wrapper";
import fetch from "cross-fetch";
import { Endpoint, toUrl } from "./net/endpoints";

export default function <D>(
  endpoint: Endpoint,
  request: unknown | undefined,
  zResponse: ParsableSchemaInput<D>,
  token?: string,
  method = "POST"
): Promise<SchemaInput<D>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  // JSON.stringify(undefined) -> undefined, so essentially no body would be passed
  // JSON.stringify({}) -> "{}", so a body would be passed if a parameter was given
  const body = JSON.stringify(request);

  return fetch(toUrl(endpoint, false).toString(), { method, headers, body })
    .then((response) => {
      return response.json().then((json) => {
        if (!response.ok) {
          throw new Error(`Error contacting API: '${json.error}'`);
        }

        return json;
      });
    })
    .then(zResponse.parse);
}
