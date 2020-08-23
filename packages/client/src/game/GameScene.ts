import { ServerInitPacket } from "@smiley-face-game/api/packets/ServerInit";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
import NetworkGunController from "@/game/components/gun/NetworkGunController";
import InputPlayerController from "@/game/player/InputPlayerController";
import NetworkPlayerController from "@/game/player/NetworkPlayerController";
import PlayerManager from "@/game/player/PlayerManager";
import Player from "@/game/player/Player";
import TileManager from "@/game/tiles/TileManager";
import World from "@/game/tiles/World";
import GameSceneInitializationData from "./GameSceneInitializationData";
import GAME_SCENE_KEY from "./GameSceneKey";
import { TILE_WIDTH, TILE_HEIGHT } from "../scenes/world/Config";
import Editor from "./components/editor/Editor";

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;

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
    // layers of the world (not to be confused with tile layers)
    let depth = 0;
    const layerVoid = this.add.container().setDepth(depth++);
    const layerTileLayerBackground = this.add.container().setDepth(depth++);
    const layerTileLayerAction = this.add.container().setDepth(depth++);
    const layerBullets = this.add.container().setDepth(depth++);
    const layerStrappedGuns = this.add.container().setDepth(depth++);
    const layerPlayers = this.add.container().setDepth(depth++);
    const layerHeldGuns = this.add.container().setDepth(depth++);
    const layerMainPlayerStrappedGun = this.add.container().setDepth(depth++);
    const layerMainPlayer = this.add.container().setDepth(depth++);
    const layerMainPlayerHeldGun = this.add.container().setDepth(depth++);
    const layerTileLayerForeground = this.add.container().setDepth(depth++);
    const layerTileLayerDecoration = this.add.container().setDepth(depth++);

    const world = new World(this, this.initPacket.size);
    layerVoid.add(world.void.display.sprite);
    layerTileLayerBackground.add(world.background.display.tilemapLayer);
    layerTileLayerAction.add(world.action.display.tilemapLayer);
    layerTileLayerForeground.add(world.foreground.display.tilemapLayer);
    layerTileLayerDecoration.add(world.decoration.display.tilemapLayer);

    world.deserializeBlocks(this.initPacket.blocks);
    this.world = world;

    this.editor = new Editor(this, world);

    this.physics.world.setBounds(0, 0, this.initPacket.size.width * TILE_WIDTH, this.initPacket.size.height * TILE_HEIGHT);

    const mainPlayerLayers = {
      bullets: layerBullets,
      strappedGuns: layerMainPlayerStrappedGun,
      player: layerMainPlayer,
      heldGun: layerMainPlayerHeldGun
    };

    const otherPlayerLayers = {
      bullets: layerBullets,
      strappedGuns: layerStrappedGuns,
      player: layerPlayers,
      heldGun: layerHeldGuns,
    };

    const players = new PlayerManager(this);
    const controller = new InputPlayerController(this);
    const mainPlayer = players.addPlayer(this.initPacket.playerId, mainPlayerLayers, world, controller, controller);
    mainPlayer.character.display.sprite.setPosition(this.initPacket.spawnPosition.x, this.initPacket.spawnPosition.y);
    this.mainPlayer = mainPlayer;

    const camera = this.cameras.main;
    camera.startFollow(mainPlayer.character.display.sprite, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowStaticBody = true;

    this.networkClient.events.onPlayerJoin = (event, _) => {
      players.addPlayer(
        event.playerId,
        otherPlayerLayers,
        world,
        new NetworkPlayerController(
          event.joinLocation.x,
          event.joinLocation.y
        ),
        new NetworkGunController()
      );
    }

    this.networkClient.events.onMovement = (event, _) => {
      const controller = players.players.get(event.playerId)!.character.controller as NetworkPlayerController;
      controller.updatePosition(event.position.x, event.position.y);
      controller.updateInput(event.inputs.left, event.inputs.right, event.inputs.up);
    }
  }

  update() {
  }
}