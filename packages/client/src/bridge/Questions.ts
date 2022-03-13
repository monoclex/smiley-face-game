import { Questioner } from "@smiley-face-game/api/questions";

export interface GameQuestions {
  signText(): Promise<string | undefined>;
}

export const gameQuestioner = new Questioner<GameQuestions>();
