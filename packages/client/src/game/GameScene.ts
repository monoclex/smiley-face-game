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

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;

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
    this.world = world;

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
    players.addPlayer(this.initPacket.playerId, mainPlayerLayers, controller, controller);

    this.networkClient.events.onPlayerJoin = (event, _) => {
      players.addPlayer(
        event.playerId,
        otherPlayerLayers,
        new NetworkPlayerController(
          event.joinLocation.x,
          event.joinLocation.y
        ),
        new NetworkGunController()
      );
    }
  }
}