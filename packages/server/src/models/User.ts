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

  @Column({
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({
    nullable: false,
    unique: false,
    length: 64
  })
  password!: string;

  @OneToMany(type => World, world => world.owner)
  worlds!: World[];
}