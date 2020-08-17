import { loadAll } from "../../assets/assets";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
import { api } from "../../isProduction";
import { WORLD_SCENE_KEY } from "../world/WorldScene";
import { LoadingSceneData } from "./LoadingSceneData";
import { serverBlockBuffer } from "../../../../api/src/packets/ServerBlockBuffer";
import { serverBlockSingle } from "../../../../api/src/packets/ServerBlockSingle";
import { blockPosition } from "../../../../api/src/schemas/BlockPosition";

export const globalVariableParkour = {
  token: "",
  name: "Smiley Face Game",
  width: 50,
  height: 50,
  id: "smiley-face-game",
};

// TODO: write my own code instead of borderline stealing code
// original code: https://github.com/digitsensitive/phaser3-typescript/blob/master/src/games/candy-crush/scenes/boot-scene.ts

export class LoadingScene extends Phaser.Scene {
  private _progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "LoadingScene"
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
  }

  create() {
    NetworkClient.connect(
      api.connection(globalVariableParkour),
      (events) => {
        events.onInit = (packet, sender) => {
          // prevent receiving any packets until the game scene changes
          sender.pause();

          const sceneData: LoadingSceneData = {
            init: packet,
            networkClient: sender,
          };

          console.time("init");
          this.scene.start(WORLD_SCENE_KEY, sceneData);
        };
      },
      serverBlockBuffer(serverBlockSingle(blockPosition(50 - 1, 50 - 1))),
      serverBlockSingle(blockPosition(50 - 1, 50 - 1))
    );
  }
}
