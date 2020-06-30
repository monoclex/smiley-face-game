import { ServerPlayerJoinPacket } from '../../../libcore/core/networking/game/ServerPlayerJoin';
import { TILE_HEIGHT, TILE_WIDTH } from '../Config';
import { WorldScene } from "../WorldScene";
import { Gun } from './Gun';
import { InputState } from './InputState';
import { Position } from './Position';

export class Player {

  get hasGun() { return this.gun !== undefined; }

  gun?: Gun = undefined;
  touchingGround: boolean = false;

  leftHeld: boolean = false;
  rightHeld: boolean = false;
  upHeld: boolean = false;

  readonly sprite: Phaser.Physics.Matter.Sprite;
  readonly mainBody: MatterJS.BodyType;
  readonly groundSensor: MatterJS.BodyType;
  readonly playerBody: MatterJS.Body;

  onGunAttached?: () => void;

  // these two exist so i can unregister the collision event things
  private _updateTouchingGround: any;
  private _matterCollisionPhysicsHandler: any;

  constructor(readonly worldScene: WorldScene, onPlayerJoinEvent: ServerPlayerJoinPacket) {
    const { joinLocation, hasGun } = onPlayerJoinEvent;

    const { sprite, mainBody, groundSensor, playerBody } = this.createPlayerBody(joinLocation);
    this.sprite = sprite;
    this.mainBody = mainBody;
    this.groundSensor = groundSensor;
    this.playerBody = playerBody;

    this.registerCollision();
    
    // register the gun AFTER the player so the gun will appear infront of the player
    // technically the groups should be controlling the rendering, but i don't want to have to constantly order them
    if (hasGun) this.attachGun();
  }

  private createPlayerBody(joinLocation: Position) {
    const sprite = this.worldScene.matter.add.sprite(0, 0, 'player');

    //@ts-ignore
    const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;

    const { width, height } = sprite;
    const widthOffset = TILE_WIDTH / 2;
    const heightOffset = TILE_HEIGHT / 2;

    // mainBody: the circle that is the player's hitbox
    // 32 (width/height of player) / 2 (32 is diameter, /2 gets radius)
    // restitution: 0 prevents player bouncing
    const mainBody = Matter.Bodies.circle(widthOffset, heightOffset, 32 / 2, { restitution: 0 });

    // ground sensor: if it collides with something, the player is permitted to jump
    const groundSensor = Matter.Bodies.rectangle(widthOffset, heightOffset + height / 2, width / 4, 2, { isSensor: true });

    const playerBody = Matter.Body.create({
      parts: [mainBody, groundSensor],
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.015,
    });

    //@ts-ignore
    sprite.setExistingBody(playerBody).setScale(1)
      .setFixedRotation()
      .setPosition(joinLocation.x, joinLocation.y);
    
    this.worldScene.groupPlayer.add(sprite);
    
    return ({
      sprite, mainBody, groundSensor, playerBody
    });
  }

  private registerCollision() {
    this._updateTouchingGround = () => this.touchingGround = false;
    this.worldScene.matter.world.on('beforeupdate', this._updateTouchingGround, this);
    this.worldScene.events.on('update', this.update, this);

    this._matterCollisionPhysicsHandler = {
      objectA: [this.groundSensor],
      callback: ({ gameObjectB, bodyB }) => {
        // don't allow jumping on things that don't have a game object (like gun sensor)
        // but DO collide with them if it's the world border (id <= 5)
        // TODO: better world border detection
        if (gameObjectB === null && bodyB.id > 5) return;
        this.touchingGround = true
      },
      context: this
    };

    //@ts-ignore
    this.worldScene.matterCollision.addOnCollideStart(this._matterCollisionPhysicsHandler);

    //@ts-ignore
    this.worldScene.matterCollision.addOnCollideActive(this._matterCollisionPhysicsHandler);
  }

  update() {
    this.handleInput();

    if (this.hasGun) {
      this.gun.update();
    }
  }

  private handleInput() {
    const moveForce = 0.0015;

    if (this.leftHeld) {
      this.sprite.flipX = true;
      this.sprite.applyForce({ x: -moveForce, y: 0 } as Phaser.Math.Vector2);
    }

    if (this.rightHeld) {
      this.sprite.flipX = false;
      this.sprite.applyForce({ x: moveForce, y: 0 } as Phaser.Math.Vector2);
    }

    const maxVel = 7;

    //@ts-ignore
    if (this.sprite.body.velocity.x > maxVel) this.sprite.setVelocityX(maxVel);
    //@ts-ignore
    if (this.sprite.body.velocity.x < -maxVel) this.sprite.setVelocityX(-maxVel);

    if (this.upHeld && this.touchingGround) {
      // this seems to make the player go up aobut 4-ish blocks
      this.sprite.setVelocityY(-9.4);
    }
  }

  attachGun() {
    if (this.hasGun) {
      console.warn('attempted to attach a gun to a player that already has a gun');
      return;
    }

    this.gun = new Gun(this.worldScene, this);
    if (this.onGunAttached) this.onGunAttached();
  }

  destroy() {
    this.sprite.destroy();
    this.worldScene.events.removeListener('beforeupdate', this._updateTouchingGround, this);
    this.worldScene.events.removeListener('update', this.update, this);

    //@ts-ignore
    this.worldScene.matterCollision.removeOnCollideStart(this._matterCollisionPhysicsHandler);
    //@ts-ignore
    this.worldScene.matterCollision.removeOnCollideActive(this._matterCollisionPhysicsHandler);

    if (this.hasGun) {
      this.gun.destroy();
    }
  }

  onMove(position: Position, inputs: InputState) {
    this.sprite.setPosition(position.x, position.y);
    this.leftHeld = inputs.left;
    this.rightHeld = inputs.right;
    this.upHeld = inputs.up;
  }
}