import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

  /** Because it's possible to have */
  @Column({ nullable: false })
  worldDataVersion!: number;

  @Column({ type: "text" })
  rawWorldData!: string;

  get worldData(): unknown {
    return JSON.parse(this.rawWorldData);
  }

  set worldData(value: unknown) {
    this.rawWorldData = JSON.stringify(value);
  }
}
