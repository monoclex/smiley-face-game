import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { ZBlock } from "@smiley-face-game/common/types";
import Account from "./Account";

@Entity()
export default class World {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Account, (author) => author.worlds)
  owner!: Account;

  @Column({ nullable: false, length: 64 })
  name!: string;

  @Column({ nullable: false })
  width!: number;

  @Column({ nullable: false })
  height!: number;

  @Column({ type: "text" })
  rawWorldData!: string;

  get worldData(): ZBlock[][][] {
    return JSON.parse(this.rawWorldData);
  }

  set worldData(value: ZBlock[][][]) {
    this.rawWorldData = JSON.stringify(value);
  }
}
