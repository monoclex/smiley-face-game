import type { Questioner, AllQuestions } from "@smiley-face-game/api/questions";
import { useEffect, DependencyList } from "react";

export default function useAnswerer<K extends keyof Qs, Qs extends AllQuestions>(
  questioner: Questioner<Qs>,
  question: K,
  answerer: Qs[K],
  deps?: DependencyList | undefined
) {
  return useEffect(() => questioner.bind(question, answerer), deps ?? []);
}
