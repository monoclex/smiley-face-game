import type { Authentication, ZJoinRequest } from "@smiley-face-game/api";
import loadAll from "./loadAll";
import GAME_SCENE_KEY from "./GameSceneKey";
import { loading } from "../recoil/atoms/loading";

interface GlobalVariableParkourType {
  token: Authentication;
  joinRequest: ZJoinRequest;
  onId: (id: string) => void;
}

export const globalVariableParkour: GlobalVariableParkourType = {
  token: (undefined as unknown) as Authentication,
  joinRequest: (undefined as unknown) as ZJoinRequest,
  onId: () => { },
};

// TODO: write my own code instead of borderline stealing code
// original code: https://github.com/digitsensitive/phaser3-typescript/blob/master/src/games/candy-crush/scenes/boot-scene.ts

export class LoadingScene extends Phaser.Scene {
  private _progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "LoadingScene",
    });
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x000000);

    this._progressBar = this.add.graphics();
    this.load.on(
      "progress",
      (value: number) => {
        this._progressBar.clear();
        this._progressBar.fillStyle(0x8a8a8a, 1);
        this._progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    loadAll(this.load);
    // loadComponentDisplays(this.load);
  }

  create() {
    globalVariableParkour.token
      .connect(globalVariableParkour.joinRequest)
      .then((connection) => {
        globalVariableParkour.onId(connection.init.worldId);
        console.time("init");
        this.scene.start(GAME_SCENE_KEY, connection);
      })
      .catch((err) => {
        loading.set({
          failed: true,
          why: err,
        });
        console.warn("caught error", err);
        this._progressBar.clear();
        this._progressBar.fillStyle(0x8a8a8a, 1);
        this._progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * -10,
          16
        );
      });
  }
}
