import Slopes from "phaser-slopes";
import { WorldBlocks } from "./components/WorldBlocks";
import { Editor } from "./components/Editor";
import MultiKey from "./components/MultiKey";
import { TILE_WIDTH, TILE_HEIGHT } from "./Config";
import { NetworkClient } from "../../networking/NetworkClient";
import { NetworkEvents } from "../../networking/NetworkEvents";
import { NetworkControlledPlayer } from "./components/NetworkControlledPlayer";
import { KeyboardControlledPlayer } from "./components/KeyboardControlledPlayer";
import { TileId } from "../../libcore/core/models/TileId";

export const WORLD_SCENE_KEY = "WorldScene";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({
      key: WORLD_SCENE_KEY
    });
  }

  /** @param {import("../loading/LoadingSceneData").LoadingSceneData} data */
  init(data) {
    this.networkClient = data.networkClient;
    this.initMessage = data.init;

    /** @type {{ width: number, height: number }} */
    this.worldSize = data.init.size;

    this._config = {
      // width and height of world
      ...data.init.size,

      // also store the blocks the editor has to place
      blocks: data.init.blocks,
    };

    this._init = data;

    /** @type {TileId[][][]} */
    this.mapData = this.initMessage.blocks;
  }

  preload() {
    // adds the phaser-slopes plugin
    // this makes it so that each individual tile *doesn't* have a square hitbox - rather, it's a polygon of all the tiles around it
    // this makes for much smoother collision and prevents weird jaggedy behavior.
    this.load.scenePlugin('Slopes', Slopes);
  }
  
  create() {

    // layer the world so certain things appear infront/behind things
    this.groupBehind = this.sys.add.group();
    this.groupAction = this.sys.add.group();
    this.groupPlayer = this.sys.add.group();
    this.groupBullets = this.sys.add.group();
    this.groupForeground = this.sys.add.group();
    this.groupGuns = this.sys.add.group();
    this.groupInfront = this.sys.add.group(); // TODO: delete

    // create a tilemap - we'll use this to make the multiple layers (background, action, foreground, etc.)
    this.tilemap = this.make.tilemap({
      // map size
      ...this.worldSize,

      // tile size
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
    });

    // tilesets hold each block and their tile id
    this.tileset = this.tilemap.addTilesetImage('atlas', 'atlas', TILE_WIDTH, TILE_HEIGHT, 0, 0);

    // holds world state - such as background, foreground, etc.
    this._worldBlocks = WorldBlocks.create(this);

    // editor allows us to do block placement stuff
    this.shiftKey = new MultiKey(this, [Phaser.Input.Keyboard.KeyCodes.SHIFT]);
    this._editor = new Editor(this);

    // BIG TODO: for some reason have to append 16 for positions in world

    // add in the player
    this._mainPlayer = new KeyboardControlledPlayer(this);

    // TODO: this should be moved elsewhwere this is uglyyyyyyyyyyyy
    // handle events when the player touches a gun (to pick one up)
    this._worldBlocks.onGunCollide = ((tileId, position, bodyB) => {
      if (bodyB === this._mainPlayer.character._mainBody) {
        this._mainPlayer.character.hasGun = true;
        this.networkClient.gotGun(position);
      }
    }).bind(this);

    // make camera follow player
    const camera = this.cameras.main;
    camera.startFollow(this._mainPlayer.character.sprite, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);
    // camera.setBounds(0, 0, this._tilemap.widthInPixels, this._tilemap.heightInPixels);

    // assign to hierarchy of groups here
    this.groupBehind.add(this._worldBlocks._layers.void);
    this.groupBehind.add(this._worldBlocks._layers.background);
    this.groupAction.add(this._worldBlocks._layers.action);
    this.groupPlayer.add(this._mainPlayer.character.sprite);
    this.groupForeground.add(this._worldBlocks._layers.foreground);

    // network event stuff
    this.networkClient.events.onBlockSingle = (event) => {
      this._worldBlocks.placeBlock(event.layer, event.position, event.id);
    };

    let players = new Map();
    this.players = players;

    this.networkClient.events.onPlayerJoin = (event) => {
      const { userId } = event;
      const player = new NetworkControlledPlayer(this, event);
      players.set(userId, player);

      this.groupPlayer.add(player.character.sprite);
      this.groupInfront.add(player.character.gunController.heldGun);
    };

    this.networkClient.events.onPlayerLeave = (event) => {
      const { userId } = event;
      
      /** @type {NetworkControlledPlayer} */
      const player = players.get(userId);

      player.character.destroy();
      players.delete(userId);
    };

    this.networkClient.events.onMovement = (event) => {
      const { sender, position, inputs } = event;

      /** @type {NetworkControlledPlayer} */
      const player = players.get(sender);

      if (player !== undefined) {
        player.onMove(position, inputs);
      }
    };

    this.networkClient.events.onPickupGun = (event) => {
      const { sender } = event;

      /** @type {NetworkControlledPlayer} */
      const player = players.get(sender);

      if (player === undefined) {
        // only the main player isn't stored in the player list
        // TODO: this might cause bugs relying on that behavior ^

        this._mainPlayer.character.hasGun = true;
      }
      else {
        player.character.hasGun = true;
      }
    };

    this.networkClient.events.onFireBullet = (event) => {
      const { sender, angle } = event;

      /** @type {NetworkControlledPlayer} */
      const player = players.get(sender);

      if (player !== undefined) {
        player._controller.setAngle(angle);
        player.character.gunController.fireBullet(angle);
      }
    };

    // now that we've registered event handlers, let's unpause the network client
    // it was paused in LoadingScene.js
    this.networkClient.continue();
  }

  /**
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    const pointer = this.input.activePointer;
    this._editor.update(pointer);

    for (const player of this.players.values()) {
      /** @type {NetworkControlledPlayer} */
      const networkPlayer = /** @type {NetworkControlledPlayer} */ player;
      networkPlayer.character.gunController.update(networkPlayer.character._controller.gunAngle());
    }

    this._mainPlayer.character.gunController.update(this._mainPlayer._controller.gunAngle());
  }
}