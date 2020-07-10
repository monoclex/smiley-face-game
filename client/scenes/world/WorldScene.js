import "phaser";
import Slopes from "phaser-slopes";
import { WorldBlocks } from "./components/WorldBlocks";
import { Editor } from "./components/Editor";
import MultiKey from "./components/MultiKey";
import { TILE_WIDTH, TILE_HEIGHT } from "./Config";
import { PrimaryPlayer } from "./components/PrimaryPlayer";
import { TileId } from "../../../common/models/TileId";
import { Player } from "./components/Player";
import { Block } from "./components/Block";
import store from "../../ui/redux/store";
import { updatePrimary, supplyTextureLoader } from "../../ui/redux/actionCreators/blockBar";
import { TileLayer } from "../../../common/models/TileLayer";
import { SERVER_BLOCK_LINE_ID } from "../../../common/networking/game/ServerBlockLine";
import { SERVER_BLOCK_SINGLE_ID } from "../../../common/networking/game/ServerBlockSingle";

export const WORLD_SCENE_KEY = "WorldScene";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super({
      key: WORLD_SCENE_KEY
    });
    this._selectedLayer = TileLayer.Foreground;
  }

  get selectedLayer() {
    if (this._selectedLayer !== -1) return this._selectedLayer;

    this._selectedLayer = {
      [TileId.Empty]: TileLayer.Foreground,
      [TileId.Full]: TileLayer.Foreground,
      [TileId.Gun]: TileLayer.Action,
    }[this.selectedBlock];

    // assume the slot to be out of range of an actual tile id
    if (this._selectedLayer === undefined) {
      this._selectedLayer = TileLayer.Foreground;
    }

    return this._selectedLayer;
  }

  set selectedLayer(layer) {
    this._selectedLayer = layer;
  }

  get selectedBlock() {
    const selected = store.getState().blockBar.selected;

    // we're passing the slot id but we just assume it to be the tile id in the meantime
    if (selected >= 3) return 0;
    return selected;
  }

  set selectedBlock(value) {
    this._selectedLayer = -1;
    updatePrimary(value)(store.dispatch);
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

    /** @type {Block[][][]} */
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
    this.containerBehindLayers = this.sys.add.container();
    this.containerUnheldGuns = this.sys.add.container();
    this.containerPlayers = this.sys.add.container();
    this.containerBullets = this.sys.add.container();
    this.containerForegroundLayer = this.sys.add.container();
    this.containerHeldGuns = this.sys.add.container();

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
    console.log(this.tileset.image);
    
    // TODO: move this to new file
    supplyTextureLoader((async (tileId) => {
      // TODO: put this in its own function?
      let start = this.tileset.image.firstFrame;
      let findId = -1;
      let foundKey = null;
      for (let key in this.tileset.image.frames) {
        if (findId !== -1) {
          findId++;
        }

        if (findId === -1 && start === key) {
          findId = 0;
        }

        if (findId === tileId) {
          foundKey = key;
          break;
        }
      }

      const frame = this.tileset.image.frames[!foundKey ? start : foundKey];

        /** @type {HTMLImageElement} */
        const imageSource = frame.source.source;

        // so we have the original image source for the texture atlas, we'll use an offscreen canvas to render specifically just the
        // texture from the atlas that we want into a canvas, dump it into some base64, and provide that as an image
        const dimensions = {
          x: frame.customData.frame.x,
          y: frame.customData.frame.y,
          width: frame.customData.frame.w,
          height: frame.customData.frame.h,
        };

        const renderImageCanvas = document.createElement('canvas');
        renderImageCanvas.width = 32;
        renderImageCanvas.height = 32;
        renderImageCanvas.convertToBlob = () => new Promise(resolve => renderImageCanvas.toBlob(resolve));

        const context = renderImageCanvas.getContext('2d');
        context.drawImage(imageSource,
          dimensions.x, dimensions.y,
          dimensions.width, dimensions.height,
          0, 0,
          TILE_WIDTH, TILE_HEIGHT
        );

        const blob = await renderImageCanvas.convertToBlob('image/png');
        const url = URL.createObjectURL(blob);
        
        const tileTexture = new Image();
        tileTexture.src = url;
        return tileTexture;
    }).bind(this))(store.dispatch)

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
    this.mainPlayerId = this.initMessage.sender;
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
    this.containerBehindLayers.add(this._worldBlocks._layers.void);
    this.containerBehindLayers.add(this._worldBlocks._layers.background);
    this.containerBehindLayers.add(this._worldBlocks._layers.action);
    this.containerPlayers.add(this.mainPlayer.sprite);
    this.containerForegroundLayer.add(this._worldBlocks._layers.foreground);

    // network event stuff
    this.networkClient.events.onBlockSingle = this.onBlockSingle.bind(this);
    this.networkClient.events.onPlayerJoin = this.onPlayerJoin.bind(this);
    this.networkClient.events.onPlayerLeave = this.onPlayerLeave.bind(this);
    this.networkClient.events.onMovement = this.onMovement.bind(this);
    this.networkClient.events.onPickupGun = this.onPickupGun.bind(this);
    this.networkClient.events.onFireBullet = this.onFireBullet.bind(this);
    this.networkClient.events.onEquipGun = this.onEquipGun.bind(this);
    this.networkClient.events.onBlockLine = this.onBlockLine.bind(this);
    this.networkClient.events.onBlockBuffer = this.onBlockBuffer.bind(this);

    // now that we've registered event handlers, let's unpause the network client
    // it was paused in LoadingScene.js
    this.networkClient.continue();

    let __tmp;
    store.subscribe(() => {
      const { blockBar } = store.getState();

      if (blockBar.selected !== __tmp) {
        __tmp = blockBar.selected;
        this._selectedLayer = -1;
      }
    })
  }

  update() {
    const pointer = this.input.activePointer;
    this._editor.update(pointer);

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
    if (sender === this.mainPlayerId) return;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received movement from non existing player');
      return;
    }

    player.onMove(position, inputs);
  }

  onPickupGun(event) {
    const { sender } = event;
    if (sender === this.mainPlayerId) return;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received onPickupGun from non existing player');
      return;
    }

    player.attachGun();
  }

  onFireBullet(event) {
    const { sender, angle } = event;
    if (sender === this.mainPlayerId) return;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received onFireBullet from non existing player');
      return;
    }

    player.gun.angle = angle;
    player.gun.fireBullet();
  }

  onEquipGun(event) {
    const { sender, equipped } = event;
    if (sender === this.mainPlayerId) return;

    const player = this.players.get(sender);

    if (player === undefined) {
      console.warn('received onEquipGun from non existing player');
      return;
    }

    player.gun.doEquip(equipped);
  }

  onBlockLine(event) {
    this._worldBlocks.placeLine(event.layer, event.start, event.end, event.id);
  }

  onBlockBuffer(event) {
    const { blocks } = event;

    for (const blockPacket of blocks) {
      if (blockPacket.packetId === SERVER_BLOCK_LINE_ID) {
        this.onBlockLine(blockPacket);
      }
      else if (blockPacket.packetId === SERVER_BLOCK_SINGLE_ID) {
        this.onBlockSingle(blockPacket);
      }
      else {
        throw new Error('unexpected kind of block data in buffer');
      }
    }
  }
}