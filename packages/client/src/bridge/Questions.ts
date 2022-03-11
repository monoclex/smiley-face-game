import { Questioner } from "@smiley-face-game/api/questions";

export interface GameQuestions {
  currentSwitchId(): number;
  signText(): Promise<string | undefined>;
}

export const gameQuestioner = new Questioner<GameQuestions>();
