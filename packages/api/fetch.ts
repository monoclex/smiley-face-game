import type { ParsableSchemaInput, SchemaInput } from "./computed-types-wrapper";
import fetch from "cross-fetch";
import { Endpoint, toUrl } from "./endpoints";

export default function <D>(
  endpoint: Endpoint,
  request: unknown | undefined,
  zResponse: ParsableSchemaInput<D>,
  token?: string,
  method: string = "POST"
): Promise<SchemaInput<D>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = token;
  }

  // JSON.stringify(undefined) -> undefined, so essentially no body would be passed
  // JSON.stringify({}) -> "{}", so a body would be passed if a parameter was given
  const body = JSON.stringify(request);

  return fetch(toUrl(endpoint, false).toString(), { method, headers, body })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error contacting API: '${response.statusText}'`);
      }

      return response.json();
    })
    .then(zResponse.parse);
}
