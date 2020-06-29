import Slopes from "phaser-slopes";
import { WorldBlocks } from "./components/WorldBlocks";
import { Editor } from "./components/Editor";
import MultiKey from "./components/MultiKey";
import { TILE_WIDTH, TILE_HEIGHT } from "./Config";
import { NetworkClient } from "../../networking/NetworkClient";
import { NetworkEvents } from "../../networking/NetworkEvents";
import { NetworkControlledPlayer } from "./components/NetworkControlledPlayer";
import { KeyboardControlledPlayer } from "./components/KeyboardControlledPlayer";

export const WORLD_SCENE_KEY = "WorldScene";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({
      key: WORLD_SCENE_KEY
    });
  }

  init(data) {
    /** @type {NetworkClient} */
    this._networkClient = data.networkClient;

    this._config = {
      // width and height of world
      ...data.init.size,

      // also store the blocks the editor has to place
      blocks: data.init.blocks,
    };

    console.log(data.init);
    this._init = { init: data.init, networkClient: undefined };
  }

  preload() {
    // adds the phaser-slopes plugin
    // this makes it so that each individual tile *doesn't* have a square hitbox - rather, it's a polygon of all the tiles around it
    // this makes for much smoother collision and prevents weird jaggedy behavior.
    this.load.scenePlugin('Slopes', Slopes);
  }
  
  create() {

    // initialize hierarchy of groups now
    this._groupBehind = this.sys.add.group();
    this._groupPlayer = this.sys.add.group();
    this._groupInfront = this.sys.add.group();
    
    // tilemap can create tilesets and tile layers which is what we need
    this._tilemap = this.make.tilemap({
      ...this._config,
      width: this._config.width,
      height: this._config.height,
    });
    
    // tileset for block id -> texture
    const tileset = this._tilemap.addTilesetImage('atlas', 'atlas', TILE_WIDTH, TILE_HEIGHT, 0, 0);

    // holds world state - such as background, foreground, etc.
    this._worldBlocks = WorldBlocks.create(this._tilemap, tileset, this.matter.world, this._config);

    // editor allows us to do block placement stuff
    const shiftKey = new MultiKey(this, [Phaser.Input.Keyboard.KeyCodes.SHIFT]);
    this._editor = new Editor(this._worldBlocks, this.input, this.cameras.main, shiftKey, this._networkClient);

    // BIG TODO: for some reason have to append 16 for positions in world

    // add in the player
    this._mainPlayer = new KeyboardControlledPlayer(
      this,
      { x: 32 + 16, y: 32 + 16 },
      this._networkClient,
      this._groupPlayer,
    );

    // TODO: this should be moved elsewhwere this is uglyyyyyyyyyyyy
    // handle events when the player touches a gun (to pick one up)
    this._worldBlocks.onGunCollide = ((tileId, position, bodyB) => {
      if (bodyB === this._mainPlayer.character._mainBody) {
        this._mainPlayer.character.hasGun = true;
        this._networkClient.gotGun(position);
      }
    }).bind(this);

    // make camera follow player
    const camera = this.cameras.main;
    camera.startFollow(this._mainPlayer.character.sprite, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);
    // camera.setBounds(0, 0, this._tilemap.widthInPixels, this._tilemap.heightInPixels);

    // assign to hierarchy of groups here
    this._groupBehind.add(this._worldBlocks._layers.void);
    this._groupBehind.add(this._worldBlocks._layers.background);
    this._groupBehind.add(this._worldBlocks._layers.action);
    this._groupPlayer.add(this._mainPlayer.character.sprite);
    this._groupInfront.add(this._worldBlocks._layers.foreground);
    this.updateRenderOrder();

    // network event stuff
    this._networkClient.events.onBlockSingle = (event) => {
      this._worldBlocks.placeBlock(event.layer, event.position, event.id);
    };

    let players = new Map();

    console.log(this._groupPlayer);
    const g = this._groupPlayer;
    this._networkClient.events.onPlayerJoin = (event) => {
      const { userId, joinLocation, hasGun } = event;
      const player = new NetworkControlledPlayer(this, joinLocation, hasGun, this._groupPlayer);
      players.set(userId, player);

      this._groupPlayer.add(player.character.sprite);
      this._groupInfront.add(player.character.gunController._heldGun);
    };

    this._networkClient.events.onPlayerLeave = (event) => {
      const { userId } = event;
      
      /** @type {NetworkControlledPlayer} */
      const player = players.get(userId);

      player.character.destroy();
      players.delete(userId);
    };

    this._networkClient.events.onMovement = (event) => {
      const { sender, position, inputs } = event;

      /** @type {NetworkControlledPlayer} */
      const player = players.get(sender);

      if (player !== undefined) {
        player.onMove(position, inputs);
      }
    };

    this._networkClient.events.onPickupGun = (event) => {
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

    // now that we've registered event handlers, let's unpause the network client
    // it was paused in LoadingScene.js
    this._networkClient.continue();
  }

  /**
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    const pointer = this.input.activePointer;
    this._editor.update(pointer);

    if (this._mainPlayer.character.hasGun) {
      this._mainPlayer.character.gunController.update(pointer, this.cameras.main);
    }
  }

  /**
   * Reorganizes all the items in the scene (background, players, and foreground) to be correct.
   * This is typically called after a player is added, or something similar.
   */
  updateRenderOrder() {
    const { displayList } = this.sys;
    this._groupBehind.children.iterate(displayList.bringToTop, displayList);
    this._groupPlayer.children.iterate(displayList.bringToTop, displayList);
    this._groupInfront.children.iterate(displayList.bringToTop, displayList);
  }
}