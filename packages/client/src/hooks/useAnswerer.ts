import type { Questioner, AllQuestions } from "@smiley-face-game/api/questions";
import { useEffectOnce } from "react-use";

export default function useAnswerer<K extends keyof Qs, Qs extends AllQuestions>(
  questioner: Questioner<Qs>,
  question: K,
  answerer: Qs[K]
) {
  return useEffectOnce(() => questioner.bind(question, answerer));
}
