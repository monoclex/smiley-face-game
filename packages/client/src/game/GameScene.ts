import { ServerInitPacket } from "@smiley-face-game/api/packets/ServerInit";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
import PlayerManager from "@/game/player/PlayerManager";
import Player from "@/game/player/Player";
import World from "@/game/world/World";
import GameSceneInitializationData from "./GameSceneInitializationData";
import GAME_SCENE_KEY from "./GameSceneKey";
import Editor from "./components/editor/Editor";
import BlockBar from "./blockbar/BlockBar";
import connectPlayerToKeyboard from "@/game/input/connectPlayerToKeyboard";

const TILE_WIDTH = 32; const TILE_HEIGHT = 32; // import { TILE_WIDTH, TILE_HEIGHT } from "../scenes/world/Config";

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;
  blockBar!: BlockBar;

  constructor() {
    super({
      key: GAME_SCENE_KEY
    })
  }

  init(data: GameSceneInitializationData) {
    this.networkClient = data.networkClient;
    this.initPacket = data.init;
  }

  create() {
    this.events.on("destroy", this.destroy, this);
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowStaticBody = true;

    // layers of the world (not to be confused with tile layers)
    let depth = 0;
    const layerVoid = this.add.container().setDepth(depth++);
    const layerTileLayerBackground = this.add.container().setDepth(depth++);
    const layerTileLayerAction = this.add.container().setDepth(depth++);
    const layerTileLayerForeground = this.add.container().setDepth(depth++);
    const layerBullets = this.add.container().setDepth(depth++);
    const layerStrappedGuns = this.add.container().setDepth(depth++);
    const layerPlayers = this.add.container().setDepth(depth++);
    const layerHeldGuns = this.add.container().setDepth(depth++);
    const layerMainPlayerStrappedGun = this.add.container().setDepth(depth++);
    const layerMainPlayer = this.add.container().setDepth(depth++);
    const layerMainPlayerHeldGun = this.add.container().setDepth(depth++);
    const layerTileLayerDecoration = this.add.container().setDepth(depth++);

    const world = new World(this, this.initPacket.size, this.networkClient);
    layerVoid.add(world.void.display.sprite);
    layerTileLayerBackground.add(world.background.display.tilemapLayer);
    layerTileLayerAction.add(world.action.display.tilemapLayer);
    layerTileLayerForeground.add(world.foreground.display.tilemapLayer);
    layerTileLayerDecoration.add(world.decoration.display.tilemapLayer);

    world.deserializeBlocks(this.initPacket.blocks);
    this.world = world;

    const blockBar = new BlockBar(world);
    this.blockBar = blockBar;
    this.editor = new Editor(this, world, blockBar);
    this.physics.world.setBounds(0, 0, this.initPacket.size.width * TILE_WIDTH, this.initPacket.size.height * TILE_HEIGHT, true, true, true, true);

    const players = new PlayerManager(this);
    const mainPlayer = players.addPlayer(this.initPacket.playerId, this.initPacket.username, layerMainPlayer);
    connectPlayerToKeyboard(mainPlayer, this.networkClient);

    mainPlayer.character.body.setPosition(this.initPacket.spawnPosition.x, this.initPacket.spawnPosition.y);
    this.mainPlayer = mainPlayer;

    const camera = this.cameras.main;
    camera.startFollow(mainPlayer.character.body, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    this.networkClient.events.onPlayerJoin = (event) => {
      const player = players.addPlayer(event.playerId, event.username, layerPlayers);
      player.character.setPosition(event.joinLocation.x, event.joinLocation.y);
    }

    this.networkClient.events.onPlayerLeave = (event) => {
      players.removePlayer(event.playerId);
    }

    this.networkClient.events.onMovement = (event) => {
      const character = players.getPlayer(event.playerId).character;
      character.setPosition(event.position.x, event.position.y);
      character.setVelocity(event.velocity.x, event.velocity.y);
      //@ts-ignore
      event.inputs.jump = event.inputs.up;
      character.updateInputs(event.inputs);

      // const controller = players.players.get(event.playerId)!.character.controller as NetworkPlayerController;
      // controller.updatePosition(event.position.x, event.position.y);
      // controller.updateInput(event.inputs.left, event.inputs.right, event.inputs.up);
    }

    this.networkClient.events.onBlockBuffer = async (event) => {
      for (const blockEvent of event.blocks) {
        await this.networkClient.events.triggerEvent(blockEvent);
      }
    }

    this.networkClient.events.onBlockLine = (event) => {
      this.world.drawLine(event.start, event.end, event.id);
    }

    this.networkClient.events.onBlockSingle = (event) => {
      this.world.placeBlock(event.position, event.id);
    }

    this.networkClient.events.onEquipGun = (event) => {
      this.players.onEquipGun(event.playerId, event.equipped);
    }

    this.networkClient.events.onFireBullet = (event) => {
      this.players.onFireBullet(event.playerId);
    }

    this.networkClient.events.onPickupGun = (event) => {
      this.players.onPickupGun(event.playerId);
    }

    this.networkClient.continue();
  }

  update() {
    // primary mouse cursor x/y
    const { x, y } = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // when the player has a gun equipped, we want the gun to point towards where they're looking
    if (this.mainPlayer.gunEquipped) {
      this.mainPlayer.getGun().setLookingAt(x, y);
    }

    // we want to prevent editing the world while the gun is equipped, so that
    // when the user presses to fire, it doesn't place/destroy a block
    this.editor.setEnabled(!this.mainPlayer.gunEquipped);
  }

  destroy() {
    this.networkClient.destroy();
  }
}