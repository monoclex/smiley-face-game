import EventSystem from "@/game/events/EventSystem";

export default interface HookRegistration {
  (payload: EventSystem): void;
}