import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import World from "./World";

@Entity()
export default class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // account details
  @Column({ nullable: false, unique: true, length: 20 })
  username!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ nullable: false, unique: false, length: 64 })
  password!: string;

  // owned things in game

  @Column()
  maxEnergy!: number;

  /**
   * This is the amount of energy the user has, at a certain point in time (`timeEnergyWasAmount`).
   */
  @Column()
  lastEnergyAmount!: number;

  /**
   * The amount of milliseconds since the Unix epoch, that points to the point in time of which lastEnergyAmount was set.
   */
  @Column({ type: "bigint" })
  timeEnergyWasAtAmount!: string;

  /**
   * Describes how many milliseconds must go by for a single energy to be regenerated.
   */
  @Column()
  energyRegenerationRateMs!: number;

  get currentEnergy(): number {
    // if they have more than the maximum amount of energy, don't bother counting it.
    if (this.lastEnergyAmount >= this.maxEnergy) {
      return this.lastEnergyAmount;
    }

    const millisecondsSinceUnixEpoch = Date.now();
    const millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - parseInt(this.timeEnergyWasAtAmount);
    const amountOfRegeneratedEnergyPrecise = millisecondsEnergyHasBeenRegenerating / this.energyRegenerationRateMs;
    const amountOfRegeneratedEnergy = Math.trunc(amountOfRegeneratedEnergyPrecise); // | 0 would also work here

    // cap the energy to maxEnergy
    return Math.min(this.lastEnergyAmount + amountOfRegeneratedEnergy, this.maxEnergy);
  }

  set currentEnergy(energy: number) {
    this.lastEnergyAmount = energy;

    const millisecondsSinceUnixEpoch = Date.now();
    this.timeEnergyWasAtAmount = "" + millisecondsSinceUnixEpoch;
  }

  @OneToMany(() => World, (world) => world.owner)
  worlds!: World[];
}
