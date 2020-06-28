import { loadAll } from "../../../assets/assets.ts";
import { WORLD_SCENE_KEY } from "../world/WorldScene";
import { NetworkClient } from "../../networking/NetworkClient.ts";

export const globalVariableParkour = {
  worldId: 'smiley-face-game'
};

// TODO: write my own code instead of borderline stealing code
// original code: https://github.com/digitsensitive/phaser3-typescript/blob/master/src/games/candy-crush/scenes/boot-scene.ts

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: "LoadingScene"
    })
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x98D687);
    this.createLoadingBar();
    
    this._progressBar = this.add.graphics();
    this.load.on('progress', (/** @type {number} */ value) => {
      this._progressBar.clear();
      this._progressBar.fillStyle(0xFFF6D3, 1);
      this._progressBar.fillRect(
        this.cameras.main.width / 4,
        this.cameras.main.height / 2 - 16,
        (this.cameras.main.width / 2) * value,
        16
      );
    }, this);

    loadAll(this.load);
  }

  update() {
    if (!this._didNetworkJoin) {
      this._didNetworkJoin = true;
      //
      NetworkClient.connect('ws://ws-api.sirjosh3917.com/smiley-face-game/ws/game/' + globalVariableParkour.worldId, ((/** @type {NetworkEvents} */ events) => {
        const packetHandler = (name) => (packet) => console.log('onpacket', name, packet);

        events.onPlayerJoin = packetHandler('onPlayerJoin');
        events.onPlayerLeave = packetHandler('onPlayerLeave');
        events.onMovement = packetHandler('onMovement');
        events.onBlockSingle = packetHandler('onBlockSingle');
        events.onInit = (packet, sender) => {
          // prevent receiving any packets until the game scene changes
          sender.pause();
          this.scene.start(WORLD_SCENE_KEY, { init: packet, networkClient: sender });
        };
      }).bind(this));
    }
  }

  /** @private */
  createLoadingBar() {
    this._loadingBar = this.add.graphics();
    this._loadingBar.fillStyle(0x5DAE47, 1);
    this._loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 4 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
  }
}