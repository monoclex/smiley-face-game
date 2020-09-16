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
import distanceAway from "../math/distanceAway";
import { createFalse } from "typescript";
import M249LMG from "@/game/guns/models/variants/M249LMG";
import { ServerPackets } from "../../../api/src/packets/ServerPackets";
import { SERVER_PLAYER_JOIN_ID } from "../../../api/src/packets/ServerPlayerJoin";
import { SERVER_PLAYER_LEAVE_ID } from "../../../api/src/packets/ServerPlayerLeave";
import { SERVER_MOVEMENT_ID } from "../../../api/src/packets/ServerMovement";
import { SERVER_BLOCK_BUFFER_ID } from "../../../api/src/packets/ServerBlockBuffer";
import { SERVER_BLOCK_LINE_ID } from "../../../api/src/packets/ServerBlockLine";
import { SERVER_BLOCK_SINGLE_ID } from "../../../api/src/packets/ServerBlockSingle";
import { SERVER_EQUIP_GUN_ID } from "../../../api/src/packets/ServerEquipGun";
import { SERVER_FIRE_BULLET_ID } from "../../../api/src/packets/ServerFireBullet";
import { SERVER_PICKUP_GUN_ID } from "../../../api/src/packets/ServerPickupGun";

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;
  blockBar!: BlockBar;
  _keyboardE!: Phaser.Input.Keyboard.Key;

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
    setInterval(() => console.log('recoil chat isActive:', window.recoil.chat.state!.isActive), 1000);
    this.events.on("destroy", this.destroy, this);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // if the player clicks and the chat is selected, deselect the chat
      if (window.recoil.chat.state!.isActive) {
        window.recoil.chat.setState!({ ...window.recoil.chat.state!, isActive: false });
      }
    }, this);

    // debug physics easier
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowStaticBody = true;

    // hook into `E`
    this._keyboardE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false);

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
    this.players = players;
    const mainPlayer = players.addPlayer(this.initPacket.playerId, this.initPacket.username, layerMainPlayer);
    connectPlayerToKeyboard(mainPlayer, this.networkClient);

    mainPlayer.body.setPosition(this.initPacket.spawnPosition.x, this.initPacket.spawnPosition.y);
    this.mainPlayer = mainPlayer;

    const camera = this.cameras.main;
    camera.startFollow(mainPlayer.body, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    this.networkClient.events.callback = (event) => {
      switch (event.packetId) {
        case SERVER_PLAYER_JOIN_ID: {
          if (event.playerId === this.mainPlayer.id) return;
  
          const player = this.players.addPlayer(event.playerId, event.username, layerPlayers);
          player.setPosition(event.joinLocation.x, event.joinLocation.y)

          if (event.hasGun) player.instantiateGun(M249LMG);
          if (event.gunEquipped) player.guaranteeGun.equipped = event.gunEquipped;

        } return;

        case SERVER_PLAYER_LEAVE_ID: {
          this.players.removePlayer(event.playerId);
        } return;

        case SERVER_MOVEMENT_ID: {
          if (event.playerId === this.mainPlayer.id) return;

          const character = players.getPlayer(event.playerId);
          character.setPosition(event.position.x, event.position.y);
          character.setVelocity(event.velocity.x, event.velocity.y);

          event.inputs.jump = event.inputs.up;
          character.updateInputs(event.inputs);
    
        } return;

        case SERVER_BLOCK_BUFFER_ID: {
          for (const blockEvent of event.blocks) {
            this.networkClient.events.callback(blockEvent);
          }
        } return;

        case SERVER_BLOCK_LINE_ID: {
          this.world.drawLine(event.start, event.end, event.id, false);
        } return;

        case SERVER_BLOCK_SINGLE_ID: {
          this.world.placeBlock(event.position, event.id, undefined, false);
        } return;

        case SERVER_EQUIP_GUN_ID: {
          if (event.playerId === this.initPacket.playerId) return;

          this.players.onEquipGun(event.playerId, event.equipped);
        } return;

        case SERVER_FIRE_BULLET_ID: {
          if (event.playerId === this.initPacket.playerId) return;

          this.players.onFireBullet(event.playerId, event.angle);
        } return;

        case SERVER_PICKUP_GUN_ID: {
          if (event.playerId === this.initPacket.playerId) return;

          this.players.onPickupGun(event.playerId);
        } return;
      }
    };

    this.networkClient.continue();
  }

  _lastBulletFire: number = 0;

  update() {
    // primary mouse cursor x/y
    const { x, y } = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // toggle the equpped-ness of the gun when E is pressed
    if (this.mainPlayer.hasGun && Phaser.Input.Keyboard.JustDown(this._keyboardE)) {
      this.mainPlayer.guaranteeGun.equipped = !this.mainPlayer.guaranteeGun.equipped;
      this.networkClient.equipGun(this.mainPlayer.guaranteeGun.equipped);
    }

    // when the player has a gun equipped, we want the gun to point towards where they're looking
    if (this.mainPlayer.gunEquipped) {
      this.mainPlayer.guaranteeGun.setLookingAt(x, y);
    }

    // we want to prevent editing the world while the gun is equipped, so that
    // when the user presses to fire, it doesn't place/destroy a block
    this.editor.setEnabled(!this.mainPlayer.gunEquipped);

    let now = Date.now();
    if (this.mainPlayer.gunEquipped && this.input.activePointer.isDown // fire bullets while mouse is down
      && this._lastBulletFire + 100 <= now) { // don't allow another bullet to be shot if it hasn't been at least 100ms since the last bullet
      this._lastBulletFire = now;

      const angle = this.mainPlayer.guaranteeGun.angle;
      this.mainPlayer.fireBullet(angle);

      // send the message of a bullet being fired
      this.networkClient.fireBullet(angle);
    }
  }

  destroy() {
    this.networkClient.destroy();
  }
}