import AuthPayload from "./payloads/AuthPayload";

export default (payload: any): payload is AuthPayload => {
  console.warn("manually validating token, this should go away in the future");
  if (typeof payload !== "object") return false;
  if (typeof payload.ver !== "number") return false;
  if (typeof payload.aud !== "string") return false;
  if (typeof payload.name !== "string" && typeof payload.name !== "undefined") return false;
  if (typeof payload.can !== "object") return false;
  if (payload.ver !== 1) return false;
  if (!Array.isArray(payload.can)) return false;
  for (const element of payload.can) {
    if (typeof element !== "string") return false;
    if (element !== "play" && element !== "shop") return false;
  }
  return true;
};
