import { NetworkClient } from "@smiley-face-game/common/NetworkClient";
import { api } from "../../isProduction";
import { LoadingSceneData } from "./LoadingSceneData";
import { serverBlockBuffer } from "@smiley-face-game/packets/ServerBlockBuffer";
import { serverBlockSingle } from "@smiley-face-game/packets/ServerBlockSingle";
import { blockPosition } from "@smiley-face-game/schemas/BlockPosition";
import loadAll from "../../game/loadAll";
import GAME_SCENE_KEY from "../../game/GameSceneKey";
import { loading } from "../../recoil/atoms/loading";

interface GlobalVariableParkourType {
  token: string,
  name: string,
  width: number,
  height: number,
  id: string,
  onId: (id: string) => void,
}

export const globalVariableParkour: GlobalVariableParkourType = {
  token: "",
  name: "Smiley Face Game",
  width: 50,
  height: 50,
  id: "smiley-face-game",
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
    const url = api.connection(globalVariableParkour);
    NetworkClient.connect(
      url,
      (client) => {
        client.events.callback = (packet) => {
          if (packet.packetId !== "SERVER_INIT") throw new Error("should've been called with server_init first");
          const sender = client;

          // prevent receiving any packets until the game scene changes
          sender.pause();

          const sceneData: LoadingSceneData = {
            init: packet,
            networkClient: sender,
          };

          globalVariableParkour.onId(packet.worldId);

          console.time("init");
          this.scene.start(GAME_SCENE_KEY, sceneData);
        };
      },
      serverBlockBuffer(serverBlockSingle(blockPosition(50 - 1, 50 - 1).BlockPositionSchema).ServerBlockSingleSchema)
        .validateServerBlockBuffer,
      serverBlockSingle(blockPosition(50 - 1, 50 - 1).BlockPositionSchema).validateServerBlockSingle,
      //@ts-ignore
      WebSocket
    ).catch((err) => {
      loading.set({
        failed: true,
        why: "error creating socket connection: " + err,
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
