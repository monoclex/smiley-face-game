import Slopes from "phaser-slopes";
import { WorldBlocks } from "./components/WorldBlocks";
import { Editor } from "./components/Editor";
import MultiKey from "./components/MultiKey";
import { TILE_WIDTH, TILE_HEIGHT } from "./Config";
import { NetworkClient } from "../../networking/NetworkClient";
import { NetworkEvents } from "../../networking/NetworkEvents";
// import { NetworkControlledPlayer } from "./components/NetworkControlledPlayer";
import { KeyboardControlledPlayer, PrimaryPlayer } from "./components/PrimaryPlayer";
import { TileId } from "../../libcore/core/models/TileId";
import { Player } from "./components/Player";

function NetworkControlledPlayer() {
  console.warn('new NetworkControlledPlayer');
}

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
    this.selectedBlock = TileId.Full;
    this._editor = new Editor(this);

    // BIG TODO: for some reason have to append 16 for positions in world

    const initAsOnJoin = {
      joinLocation: this.initMessage.spawnPosition,
      hasGun: false
    };
    this.mainPlayer = new PrimaryPlayer(this, initAsOnJoin);

    // add support to recognize other players
    /** @type {Map<string, Player>} */
    this.players = new Map();

    // TODO: this should be moved elsewhwere this is uglyyyyyyyyyyyy
    // handle events when the player touches a gun (to pick one up)
    this._worldBlocks.onGunCollide = ((tileId, position, bodyB) => {
      if (bodyB === this.mainPlayer.mainBody && !this.mainPlayer.hasGun) {
        this.mainPlayer.attachGun();
        this.networkClient.gotGun(position);
      }
    }).bind(this);

    // make camera follow player
    const camera = this.cameras.main;
    camera.startFollow(this.mainPlayer.sprite, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    // assign to hierarchy of groups here
    this.groupBehind.add(this._worldBlocks._layers.void);
    this.groupBehind.add(this._worldBlocks._layers.background);
    this.groupAction.add(this._worldBlocks._layers.action);
    this.groupPlayer.add(this.mainPlayer.sprite);
    this.groupForeground.add(this._worldBlocks._layers.foreground);

    // network event stuff
    this.networkClient.events.onBlockSingle = this.onBlockSingle.bind(this);
    this.networkClient.events.onPlayerJoin = this.onPlayerJoin.bind(this);
    this.networkClient.events.onPlayerLeave = this.onPlayerLeave.bind(this);
    this.networkClient.events.onMovement = this.onMovement.bind(this);
    this.networkClient.events.onPickupGun = this.onPickupGun.bind(this);
    this.networkClient.events.onFireBullet = this.onFireBullet.bind(this);

    // now that we've registered event handlers, let's unpause the network client
    // it was paused in LoadingScene.js
    this.networkClient.continue();
  }

  update() {
    const pointer = this.input.activePointer;
    this._editor.update(pointer);

    for (const player of this.players.values()) {
      // player.character.gunController.update(player.character._controller.gunAngle());
    }

    if (this.mainPlayer.hasGun) {

      const worldPosition = pointer.positionToCamera(this.cameras.main);
      
      // get the angle from the player to the pointer
      const angle = Phaser.Math.Angle.BetweenPoints(this.mainPlayer.sprite, worldPosition);

      this.mainPlayer.gun.angle = angle;
    }
  }

  onBlockSingle(event) {
    this._worldBlocks.placeBlock(event.layer, event.position, event.id);
  }

  onPlayerJoin(event) {
    const { userId } = event;
    const player = new Player(this, event);
    this.players.set(userId, player);
  }

  onPlayerLeave(event) {
    const { userId } = event;
    
    const player = this.players.get(userId);

    // TODO: these probably aren't needed, but i'm doing it for good measure since this game is in its early stages
    if (player === undefined) {
      console.warn('received onPlayerLeave from non existing player');
      return;
    }

    this.players.delete(userId);

    player.destroy();
  }

  onMovement(event) {
    const { sender, position, inputs } = event;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received movement from non existing player');
      return;
    }

    player.onMove(position, inputs);
  }

  onPickupGun(event) {
    const { sender } = event;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received onPickupGun from non existing player');
      return;
    }

    player.attachGun();
  }

  onFireBullet(event) {
    const { sender, angle } = event;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received onFireBullet from non existing player');
      return;
    }

    player.gun.angle = angle;
    player.gun.fireBullet();
  }
}