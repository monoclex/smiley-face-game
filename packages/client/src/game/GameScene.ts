import M249LMG from "./guns/models/variants/M249LMG";
import Player from "./player/Player";
import PlayerManager from "./player/PlayerManager";
import World from "./world/World";
import { isDev } from "../isProduction";
import { chat } from "../recoil/atoms/chat";
import type { Connection } from "@smiley-face-game/common";
import type { ZRole } from "@smiley-face-game/common";
import { Message, messages } from "../recoil/atoms/chat/index";
import { loading } from "../recoil/atoms/loading/index";
import { playerList } from "../recoil/atoms/playerList";
import BlockBar from "./blockbar/BlockBar";
import Editor from "./components/editor/Editor";
import type { LoadingSceneData } from "../scenes/loading/LoadingSceneData";
import GAME_SCENE_KEY from "./GameSceneKey";
import registerKeyboard from "./input/registerKeyboard";
import InputPipe from "./input/InputPipe";
import toast from "../SnackbarUtils";
import type { ZSInit } from "@smiley-face-game/common/src/packets";
import { blockbar as recoilBlockbar } from "../recoil/atoms/blockbar";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32; // import { TILE_WIDTH, TILE_HEIGHT } from "../scenes/world/Config";

export default class GameScene extends Phaser.Scene {
  connection!: Connection;
  initPacket!: ZSInit;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;
  blockBar!: BlockBar;
  self!: { playerId: number; username: string; role: ZRole };

  constructor() {
    super({
      key: GAME_SCENE_KEY,
    });
    window.gameScene = this;
  }

  init(data: LoadingSceneData) {
    this.cameras.main.roundPixels = true;
    this.connection = data.connection;
    this.initPacket = this.connection.init;

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

    registerKeyboard();

    // layers of the world (not to be confused with tile layers)
    let depth = 0;
    const layerVoid = this.add.container().setDepth(depth++);
    const layerTileLayerBackground = this.add.container().setDepth(depth++);
    const layerTileLayerAction = this.add.container().setDepth(depth++);
    const layerTileLayerForeground = this.add.container().setDepth(depth++);
    const layerPlayers = this.add.container().setDepth(depth++);
    const layerMainPlayer = this.add.container().setDepth(depth++);
    const layerTileLayerDecoration = this.add.container().setDepth(depth++);

    const world = new World(this, this.initPacket.size, this.connection);
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

    runConnection.bind(this)().catch((error) => console.error("error handling message", error));
    async function runConnection(this: GameScene) {
      for await (const event of this.connection) {
        switch (event.packetId) {
          case "SERVER_PLAYER_JOIN":
            {
              if (event.playerId === this.mainPlayer.id) break;

              const player = this.players.addPlayer(event.playerId, event.username, layerPlayers);
              player.setPosition(event.joinLocation.x, event.joinLocation.y);

              if (event.hasGun) player.instantiateGun(M249LMG);
              if (event.gunEquipped) player.guaranteeGun.equipped = event.gunEquipped;

              // UI - add player
              let newPlayer = {
                playerId: event.playerId,
                username: event.username,
                role: event.role as ZRole,
              };

              playerList.modify({ players: [newPlayer, ...playerList.state.players] });
            }
            break;

          case "SERVER_PLAYER_LEAVE":
            {
              this.players.removePlayer(event.playerId);

              // UI - remove player
              playerList.modify({
                players: playerList.state.players.filter((player) => player.playerId !== event.playerId),
              });
            }
            break;

          case "SERVER_MOVEMENT":
            {
              if (event.playerId === this.mainPlayer.id) break;

              const character = players.getPlayer(event.playerId);
              character.setPosition(event.position.x, event.position.y);
              character.setVelocity(event.velocity.x, event.velocity.y);

              character.updateInputs(event.inputs);
            }
            break;

          case "SERVER_BLOCK_LINE":
            {
              this.world.drawLine(event.start, event.end, event.block, false, event.layer);
            }
            break;

          case "SERVER_BLOCK_SINGLE":
            {
              this.world.placeBlock(event.position, event.block, event.layer, false);
            }
            break;

          case "SERVER_EQUIP_GUN":
            {
              if (event.playerId === this.initPacket.playerId) break;

              this.players.onEquipGun(event.playerId, event.equipped);
            }
            break;

          case "SERVER_FIRE_BULLET":
            {
              if (event.playerId === this.initPacket.playerId) break;

              this.players.onFireBullet(event.playerId, event.angle);
            }
            break;

          case "SERVER_PICKUP_GUN":
            {
              if (event.playerId === this.initPacket.playerId) break;

              this.players.onPickupGun(event.playerId);
            }
            break;

          case "SERVER_CHAT":
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
            break;

          case "SERVER_ROLE_UPDATE":
            {
              const modified = playerList.state.players.map((player) => {
                if (player.playerId === event.playerId) {
                  const modified = {
                    ...player,
                    role: event.newRole as ZRole,
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
            break;

          case "SERVER_WORLD_ACTION":
            switch (event.action.action) {
              case "load":
                toast.success("World loaded!");
                console.time("init");
                this.world.clear();
                this.world.deserializeBlocks(event.action.blocks);
                break;
              case "save":
                toast.success("World saved!");
                break;
            }
            break;
        }
      }
    }

    playerList.set({ players: [this.self] });
    for (const event of this.initPacket.players) {
      if (event.playerId === this.mainPlayer.id) continue;

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

    // setup the block bar with blocks so players can place stuff
    recoilBlockbar.modify({
      loader: world.tileManager.imageOf.bind(world.tileManager),
      slots: {
        ...recoilBlockbar.state.slots,
        [0]: this.connection.tileJson.id("empty"),
        [1]: this.connection.tileJson.id("basic-white"),
        [2]: this.connection.tileJson.id("gun"),
        [3]: this.connection.tileJson.id("arrow-up"),
        [4]: this.connection.tileJson.id("prismarine-basic"),
        [5]: this.connection.tileJson.id("gemstone-red"),
        [6]: this.connection.tileJson.id("tshell-white"),
        [7]: this.connection.tileJson.id("pyramid-white"),
        [8]: this.connection.tileJson.id("choc-l0"),
      }
    });

    loading.set({ failed: false });
  }

  _lastBulletFire: number = 0;

  update() {
    // primary mouse cursor x/y
    const { x, y } = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // if the chat is inactive, we'll process the keyboard as if it were inputs
    if (!chat.state.isActive) {
      let inputs = {
        left: !!InputPipe.left,
        right: !!InputPipe.right,
        up: !!InputPipe.up,
        jump: !!InputPipe.jump,
      };

      if (
        inputs.jump !== this.mainPlayer.input.jump ||
        inputs.left !== this.mainPlayer.input.left ||
        inputs.right !== this.mainPlayer.input.right ||
        inputs.up !== this.mainPlayer.input.up
      ) {
        this.mainPlayer.updateInputs(inputs);
        this.connection.move(this.mainPlayer.body, this.mainPlayer.body.body.velocity, this.mainPlayer.input);
      }

      // toggle the equpped-ness of the gun when E is pressed
      if (this.mainPlayer.hasGun && !!InputPipe.equip) {
        InputPipe.equip = false;
        this.mainPlayer.guaranteeGun.equipped = !this.mainPlayer.guaranteeGun.equipped;
        this.connection.equipGun(this.mainPlayer.guaranteeGun.equipped);
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
    if (this.mainPlayer.gunEquipped) {
      this.editor.setEnabled(false);
    }
    else if (this.self.role === "edit" || this.self.role === "owner") {
      this.editor.setEnabled(true);
    }

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
      this.connection.fireBullet(angle);
    }
  }

  destroy() {
    this.connection.close();
  }
}
