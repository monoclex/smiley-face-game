import { TILE_WIDTH, TILE_HEIGHT } from "../Config";
import { Scene } from "phaser";

interface CharacterSensors {
  readonly bottom: MatterJS.BodyType;
}

interface CharacterTouching {
  bottom: boolean;
}

interface Position {
  readonly x: number;
  readonly y: number;
}

export interface CharacterController {
  isLeft(): boolean;
  isRight(): boolean;
  isUp(): boolean;
}

export class Character {
  readonly sprite: Phaser.Physics.Matter.Sprite;
  private readonly _sensors: CharacterSensors;

  private _touching: CharacterTouching = { bottom: false };

  constructor(
    private readonly _scene: Phaser.Scene,
    private readonly _controller: CharacterController,
    spawnPosition: Position
  ) {
    this.sprite = this._scene.matter.add.sprite(0, 0, 'player', null);
    
    //@ts-ignore
    const Matter: typeof MatterJS = Phaser.Physics.Matter.Matter;
    const { Body, Bodies } = Matter;

    // setup character body
    const { width, height } = this.sprite;
    const widthOffset = TILE_WIDTH / 2;
    const heightOffset = TILE_HEIGHT / 2;

    // player hitbox
    const mainBody = Bodies.circle(widthOffset, heightOffset, 16, { restitution: 0 });

    // sensors - so we can check if they're running into walls or able to jump
    this._sensors = {
      bottom: Bodies.rectangle(widthOffset, heightOffset + height / 2, width / 4, 2, { isSensor: true })
    };

    const characterBody = Body.create({
      parts: [mainBody, this._sensors.bottom],
      frictionStatic: 0,
      frictionAir: 0.015,
      friction: 0
    });

    //@ts-ignore
    this.sprite.setExistingBody(characterBody)
      //@ts-ignore
      .setScale(1)
      .setFixedRotation()
      .setPosition(spawnPosition.x, spawnPosition.y);

    // this will register the character in the world
    this._scene.matter.world.on('beforeupdate', this._resetTouching, this);
    this._scene.events.on('update', this._update, this);

    //@ts-ignore
    this._scene.matterCollision.addOnCollideStart({
      objectA: [this._sensors.bottom],
      callback: this._onSensorCollide,
      context: this
    });

    //@ts-ignore
    this._scene.matterCollision.addOnCollideActive({
      objectA: [this._sensors.bottom],
      callback: this._onSensorCollide,
      context: this
    });
  }

  private _resetTouching() {
    this._touching.bottom = false;
  }

  // the only sensor is the bottom sensor
  private _onSensorCollide() {
    this._touching.bottom = true;
  }

  private _update() {
    const moveForce = 0.0015;

    if (this._controller.isLeft()) {
      this.sprite.setFlipX(true);
      this.sprite.applyForce(new Phaser.Math.Vector2(-moveForce, 0));
    }

    if (this._controller.isRight()) {
      this.sprite.setFlipX(false);
      this.sprite.applyForce(new Phaser.Math.Vector2(moveForce, 0));
    }

    const maxVel = 7;
    //@ts-ignore
    if (this.sprite.body.velocity.x > maxVel) this.sprite.setVelocityX(maxVel);
    //@ts-ignore
    else if (this.sprite.body.velocity.x < -maxVel) this.sprite.setVelocityX(-maxVel);

    if (this._controller.isUp() && this._touching.bottom) {
      // seems to make the player go up about 4 blocks
      this.sprite.setVelocityY(-9.4);
    }
  }

  getPosition(): Position {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  getMatterJSBody(): MatterJS.BodyType {
    return this.sprite.body as MatterJS.BodyType;
  }

  destroy() {
    this.sprite.destroy(false);
    this._scene.events.removeListener('beforeupdate', this._resetTouching, this);
    this._scene.events.removeListener('update', this._update, this);

    //@ts-ignore
    this._scene.matterCollision.removeOnCollideStart({
      objectA: [this._sensors.bottom],
      callback: this._onSensorCollide,
      context: this
    });

    //@ts-ignore
    this._scene.matterCollision.removeOnCollideActive({
      objectA: [this._sensors.bottom],
      callback: this._onSensorCollide,
      context: this
    });
  }
}