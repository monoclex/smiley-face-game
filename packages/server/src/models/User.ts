import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { World } from './World';

@Entity()
export class User {

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    nullable: false,
    unique: true,
    length: 32,
  })
  username!: string;

  @OneToMany(type => World, world => world.owner)
  worlds!: World[];
}