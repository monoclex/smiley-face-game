import type { SchemaInput } from "./computed-types-wrapper";
import fetch from "cross-fetch";
import { Endpoint, toUrl } from "./endpoints";

/** awful method that wraps around `fetch` in an awful way, TODO: beautify */
export default function <D extends { parse: (input: unknown) => SchemaInput<D> }>(
  endpoint: Endpoint,
  request: unknown | undefined,
  zResponse: D,
  token?: string,
  method?: string
): Promise<SchemaInput<D>> {
  /* awful patching to the parameters */
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = token;
  method = method || "POST";
  const body = request === undefined ? undefined : JSON.stringify(request);

  return fetch(toUrl(endpoint, false).href, { method, headers, body })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error contacting API: '${response.statusText}'`);
      }

      return response.json();
    })
    .then(zResponse.parse);
}
