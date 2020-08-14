import { Connection } from "typeorm";
import AccountRepo from "@/database/repos/AccountRepo";
import WorldRepo from "@/database/repos/WorldRepo";
import JwtVerifier from "@/jwt/JwtVerifier";
import JwtProvider from "@/jwt/JwtProvider";
import RoomManager from "./worlds/RoomManager";

export default class Dependencies {
  constructor(connection: Connection, jwtSecret: string) {
    this.accountRepo = new AccountRepo(connection);
    this.worldRepo = new WorldRepo(connection);
    this.jwtVerifier = new JwtVerifier(jwtSecret);
    this.jwtProvider = new JwtProvider(jwtSecret);
    this.roomManager = new RoomManager(this);
  }

  readonly accountRepo: AccountRepo;
  readonly worldRepo: WorldRepo;
  readonly jwtVerifier: JwtVerifier;
  readonly jwtProvider: JwtProvider;
  readonly roomManager: RoomManager;
}