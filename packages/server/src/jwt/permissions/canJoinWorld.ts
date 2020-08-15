import AuthPayload from "@/jwt/payloads/AuthPayload";

export default function canJoinWorld(payload: AuthPayload): boolean {
  return payload.can.includes("play");
}
