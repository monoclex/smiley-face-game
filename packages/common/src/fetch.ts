import * as z from "zod";
import fetch from "cross-fetch";
import { Endpoint } from "./endpoints";

/** awful method that wraps around `fetch` in an awful way, TODO: beautify */
export default function <T, D extends z.ZodTypeDef>(
  endpoint: Endpoint,
  request: unknown | undefined,
  zResponse: z.ZodType<T, D>,
  token?: string,
  method?: string,
): Promise<z.infer<z.ZodType<T, D>>> {
  /* awful patching to the parameters */
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = token;
  method = method || "POST";
  const body = request === undefined ? undefined : JSON.stringify(request);

  return fetch(endpoint.host + endpoint.path, { method, headers, body })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error contacting API: '${response.statusText}'`);
      }

      return response.json();
    })
    .then(zResponse.parse);
}