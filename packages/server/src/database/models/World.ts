import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Block } from "@smiley-face-game/schemas/Block";
import Account from "./Account";

@Entity()
export default class World {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne((type) => Account, (author) => author.worlds)
  owner!: Account;

  @Column({ nullable: false, length: 64 })
  name!: string;

  @Column({ nullable: false })
  width!: number;

  @Column({ nullable: false })
  height!: number;

  @Column({ type: "text" })
  rawWorldData!: string;

  get worldData(): Block[][][] {
    return JSON.parse(this.rawWorldData);
  }

  set worldData(value: Block[][][]) {
    this.rawWorldData = JSON.stringify(value);
  }
}
