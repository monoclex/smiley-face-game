import type { Authentication, ZJoinRequest } from "@smiley-face-game/api";

interface GlobalVariableParkourType {
  token: Authentication;
  joinRequest: ZJoinRequest;
  onId: (id: string) => void;
}

export const globalVariableParkour: GlobalVariableParkourType = {
  token: (undefined as unknown) as Authentication,
  joinRequest: (undefined as unknown) as ZJoinRequest,
  onId: () => {},
};
