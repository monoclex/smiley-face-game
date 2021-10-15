import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import Account from "./Account";
import UuidGenerator from "../../UuidGenerator";

@Entity()
export default class World {
  // TODO: this is scary
  // == begin scary ==
  @BeforeInsert()
  beforeInsert() {
    this.id = new UuidGenerator().getnIdForSavedWorld();
  }

  @PrimaryColumn("uuid")
  id!: string;
  // == end scary ==

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
