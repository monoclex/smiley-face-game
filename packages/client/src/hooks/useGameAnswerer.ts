import { GameQuestions, gameQuestioner } from "@/bridge/Questions";
import useAnswerer from "./useAnswerer";

export default function useGameAnswerer<K extends keyof GameQuestions>(
  question: K,
  answer: GameQuestions[K]
) {
  return useAnswerer(gameQuestioner, question, answer);
}
