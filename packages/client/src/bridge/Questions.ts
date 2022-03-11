import { Questioner } from "@smiley-face-game/api/questions";

export interface GameQuestions {
  currentSwitchId(): number;
}

export const gameQuestioner = new Questioner<GameQuestions>();
