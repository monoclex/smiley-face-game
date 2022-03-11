import { GameQuestions, gameQuestioner } from "@/bridge/Questions";
import { DependencyList } from "react";
import useAnswerer from "./useAnswerer";

export default function useGameAnswerer<K extends keyof GameQuestions>(
  question: K,
  answer: GameQuestions[K],
  deps?: DependencyList | undefined
) {
  return useAnswerer(gameQuestioner, question, answer, deps ?? []);
}
