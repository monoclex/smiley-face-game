import { Block } from '@smiley-face-game/api/src/models/Block';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from './User';

@Entity()
export class World {

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(type => User, author => author.worlds)
  owner: User;

  @Column({
    type: "text"
  })
  private data: string;

  get worldData(): Block[][][] {
    return JSON.parse(this.data);
  }

  set worldData(value: Block[][][]) {
    this.data = JSON.stringify(value);
  }

  constructor(
    data: Block[][][],
    owner: User,
  ) {
    this.owner = owner;
    this.worldData = data;
  }
}