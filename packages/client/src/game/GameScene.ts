import M249LMG from "./guns/models/variants/M249LMG";
import Player from "./player/Player";
import PlayerManager from "./player/PlayerManager";
import World from "./world/World";
import { isDev } from "../isProduction";
import { chat } from "../recoil/atoms/chat";
import { NetworkClient } from "@smiley-face-game/common/NetworkClient";
import { SERVER_BLOCK_BUFFER_ID } from "@smiley-face-game/packets/ServerBlockBuffer";
import { SERVER_BLOCK_LINE_ID } from "@smiley-face-game/packets/ServerBlockLine";
import { SERVER_BLOCK_SINGLE_ID } from "@smiley-face-game/packets/ServerBlockSingle";
import { SERVER_CHAT_ID } from "@smiley-face-game/packets/ServerChat";
import { SERVER_EQUIP_GUN_ID } from "@smiley-face-game/packets/ServerEquipGun";
import { SERVER_FIRE_BULLET_ID } from "@smiley-face-game/packets/ServerFireBullet";
import { ServerInitPacket } from "@smiley-face-game/packets/ServerInit";
import { SERVER_MOVEMENT_ID } from "@smiley-face-game/packets/ServerMovement";
import { SERVER_PICKUP_GUN_ID } from "@smiley-face-game/packets/ServerPickupGun";
import { SERVER_PLAYER_JOIN_ID } from "@smiley-face-game/packets/ServerPlayerJoin";
import { SERVER_PLAYER_LEAVE_ID } from "@smiley-face-game/packets/ServerPlayerLeave";
import { SERVER_ROLE_UPDATE_ID } from "@smiley-face-game/packets/ServerRoleUpdate";
import PlayerRole from "@smiley-face-game/common/PlayerRole";
import { Message, messages } from "../recoil/atoms/chat/index";
import { loading } from "../recoil/atoms/loading/index";
import { playerList } from "../recoil/atoms/playerList";
import BlockBar from "./blockbar/BlockBar";
import Editor from "./components/editor/Editor";
import GameSceneInitializationData from "./GameSceneInitializationData";
import GAME_SCENE_KEY from "./GameSceneKey";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32; // import { TILE_WIDTH, TILE_HEIGHT } from "../scenes/world/Config";

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;
  blockBar!: BlockBar;
  _input = { up: 0, left: 0, right: 0, jump: false, equip: false }; // use numbers incase more than 1 key is activating the input
  self!: { playerId: number; username: string; role: PlayerRole };

  constructor() {
    super({
      key: GAME_SCENE_KEY,
    });
    window.gameScene = this;
  }

  init(data: GameSceneInitializationData) {
    this.cameras.main.roundPixels = true;
    this.networkClient = data.networkClient;
    this.initPacket = data.init;

    const self = {
      playerId: this.initPacket.playerId,
      username: this.initPacket.username,
      role: this.initPacket.role,
    };

    this.self = self;
  }

  create() {
    this.events.on("destroy", this.destroy, this);

    this.input.on(
      "pointerdown",
      () => {
        // if the player clicks and the chat is selected, deselect the chat
        if (chat.state.isActive) {
          chat.modify({ isActive: false });
        }
      },
      this
    );

    // debug physics easier
    this.physics.world.defaults.debugShowBody = isDev;
    this.physics.world.defaults.debugShowStaticBody = isDev;

    // hook the keyboard
    const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;
    [UP, W]
      .map((key) =>
        this.input.keyboard.addKey(key, false /* don't call preventDefault() since we want to handle the chat */)
      )
      .map((key) => {
        key.on("down", () => {
          this._input.up++;
        });
        key.on("up", () => {
          this._input.up = Math.max(this._input.up - 1, 0);
        }); // TODO: figure out why bug occurs that requires Math.max
      });

    [SPACE]
      .map((key) =>
        this.input.keyboard.addKey(key, false /* don't call preventDefault() since we want to handle the chat */)
      )
      .map((key) => {
        key.on("down", () => {
          this._input.jump = true;
        });
        key.on("up", () => {
          this._input.jump = false;
        });
      });

    [A, LEFT]
      .map((key) =>
        this.input.keyboard.addKey(key, false /* don't call preventDefault() since we want to handle the chat */)
      )
      .map((key) => {
        key.on("down", () => {
          this._input.left++;
        });
        key.on("up", () => {
          this._input.left = Math.max(this._input.left - 1, 0);
        }); // TODO: figure out why bug occurs that requires Math.max
      });

    [D, RIGHT]
      .map((key) =>
        this.input.keyboard.addKey(key, false /* don't call preventDefault() since we want to handle the chat */)
      )
      .map((key) => {
        key.on("down", () => {
          this._input.right++;
        });
        key.on("up", () => {
          this._input.right = Math.max(this._input.right - 1, 0);
        }); // TODO: figure out why bug occurs that requires Math.max
      });

    [E]
      .map((key) =>
        this.input.keyboard.addKey(key, false /* don't call preventDefault() since we want to handle the chat */)
      )
      .map((key) => {
        key.on("down", () => {
          this._input.equip = true;
        });
        key.on("up", () => {
          this._input.equip = false;
        });
      });

    // layers of the world (not to be confused with tile layers)
    let depth = 0;
    const layerVoid = this.add.container().setDepth(depth++);
    const layerTileLayerBackground = this.add.container().setDepth(depth++);
    const layerTileLayerAction = this.add.container().setDepth(depth++);
    const layerTileLayerForeground = this.add.container().setDepth(depth++);
    const layerPlayers = this.add.container().setDepth(depth++);
    const layerMainPlayer = this.add.container().setDepth(depth++);
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
    this.physics.world.setBounds(
      0,
      0,
      this.initPacket.size.width * TILE_WIDTH,
      this.initPacket.size.height * TILE_HEIGHT,
      true,
      true,
      true,
      true
    );

    const players = new PlayerManager(this);
    this.players = players;
    const mainPlayer = players.addPlayer(this.initPacket.playerId, this.initPacket.username, layerMainPlayer);

    mainPlayer.body.setPosition(this.initPacket.spawnPosition.x, this.initPacket.spawnPosition.y);
    this.mainPlayer = mainPlayer;

    const camera = this.cameras.main;
    camera.startFollow(mainPlayer.body, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    this.networkClient.events.callback = (event) => {
      switch (event.packetId) {
        case SERVER_PLAYER_JOIN_ID:
          {
            if (event.playerId === this.mainPlayer.id) return;

            const player = this.players.addPlayer(event.playerId, event.username, layerPlayers);
            player.setPosition(event.joinLocation.x, event.joinLocation.y);

            if (event.hasGun) player.instantiateGun(M249LMG);
            if (event.gunEquipped) player.guaranteeGun.equipped = event.gunEquipped;

            // UI - add player
            let newPlayer = {
              playerId: event.playerId,
              username: event.username,
              role: event.role,
            };

            playerList.modify({ players: [newPlayer, ...playerList.state.players] });
          }
          return;

        case SERVER_PLAYER_LEAVE_ID:
          {
            this.players.removePlayer(event.playerId);

            // UI - remove player
            playerList.modify({
              players: playerList.state.players.filter((player) => player.playerId !== event.playerId),
            });
          }
          return;

        case SERVER_MOVEMENT_ID:
          {
            if (event.playerId === this.mainPlayer.id) return;

            const character = players.getPlayer(event.playerId);
            character.setPosition(event.position.x, event.position.y);
            character.setVelocity(event.velocity.x, event.velocity.y);

            character.updateInputs(event.inputs);
          }
          return;

        case SERVER_BLOCK_BUFFER_ID:
          {
            for (const blockEvent of event.blocks) {
              this.networkClient.events.callback(blockEvent);
            }
          }
          return;

        case SERVER_BLOCK_LINE_ID:
          {
            this.world.drawLine(event.start, event.end, event, false, event.layer);
          }
          return;

        case SERVER_BLOCK_SINGLE_ID:
          {
            this.world.placeBlock(event.position, event, event.layer, false);
          }
          return;

        case SERVER_EQUIP_GUN_ID:
          {
            if (event.playerId === this.initPacket.playerId) return;

            this.players.onEquipGun(event.playerId, event.equipped);
          }
          return;

        case SERVER_FIRE_BULLET_ID:
          {
            if (event.playerId === this.initPacket.playerId) return;

            this.players.onFireBullet(event.playerId, event.angle);
          }
          return;

        case SERVER_PICKUP_GUN_ID:
          {
            if (event.playerId === this.initPacket.playerId) return;

            this.players.onPickupGun(event.playerId);
          }
          return;

        case SERVER_CHAT_ID:
          {
            const player = this.players.getPlayer(event.playerId);
            const newMessage: Message = {
              id: messages.state.length,
              timestamp: Date.now(),
              username: player.username,
              content: event.message,
            };
            messages.set([newMessage, ...messages.state]);
          }
          return;

        case SERVER_ROLE_UPDATE_ID:
          {
            const modified = playerList.state.players.map((player) => {
              if (player.playerId === event.playerId) {
                const modified = {
                  ...player,
                  role: event.newRole,
                };

                if (player.playerId === mainPlayer.id) {
                  this.self = modified;
                }

                return modified;
              } else {
                return player;
              }
            });

            playerList.modify({ players: modified });
          }
          return;
      }
    };

    playerList.set({ players: [this.self] });
    this.networkClient.continue();
    loading.set({ failed: false });
  }

  _lastBulletFire: number = 0;

  update() {
    // primary mouse cursor x/y
    const { x, y } = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // if the chat is inactive, we'll process the keyboard as if it were inputs
    if (!chat.state.isActive) {
      let inputs = {
        left: this._input.left > 0,
        right: this._input.right > 0,
        up: this._input.up > 0,
        jump: this._input.jump,
      };

      if (
        inputs.jump !== this.mainPlayer.input.jump ||
        inputs.left !== this.mainPlayer.input.left ||
        inputs.right !== this.mainPlayer.input.right ||
        inputs.up !== this.mainPlayer.input.up
      ) {
        this.mainPlayer.updateInputs(inputs);
        this.networkClient.move(this.mainPlayer.body, this.mainPlayer.body.body.velocity, this.mainPlayer.input);
      }

      // toggle the equpped-ness of the gun when E is pressed
      if (this.mainPlayer.hasGun && this._input.equip) {
        this._input.equip = false;
        this.mainPlayer.guaranteeGun.equipped = !this.mainPlayer.guaranteeGun.equipped;
        this.networkClient.equipGun(this.mainPlayer.guaranteeGun.equipped);
      }
    }

    // when the player has a gun equipped, we want the gun to point towards where they're looking
    if (this.mainPlayer.gunEquipped) {
      this.mainPlayer.guaranteeGun.setLookingAt(x, y);
    }

    // we want to prevent editing the world while the gun is equipped, so that
    // when the user presses to fire, it doesn't place/destroy a block
    //
    // we also want to prevent the user from editing if they don't have edit
    this.editor.setEnabled((!this.mainPlayer.gunEquipped && this.self.role === "edit") || this.self.role === "owner");

    let now = Date.now();
    if (
      this.mainPlayer.gunEquipped &&
      this.input.activePointer.isDown && // fire bullets while mouse is down
      this._lastBulletFire + 100 <= now
    ) {
      // don't allow another bullet to be shot if it hasn't been at least 100ms since the last bullet
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
