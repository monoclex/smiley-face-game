import { useGameState } from "@/ui/hooks";
import useGameEvent from "./useGameEvent";
import useRerender from "./useRerender";

export default function useSelf() {
  const { self } = useGameState();
  const rerender = useRerender();
  useGameEvent("onSelfUpdated", () => rerender());
  return self;
}
