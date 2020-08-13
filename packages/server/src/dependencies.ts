import { Connection } from "typeorm";
import AccountRepo from "@/database/repos/AccountRepo";
import WorldRepo from "@/database/repos/WorldRepo";
import JwtVerifier from "@/jwt/JwtVerifier";

export default class Dependencies {
  constructor(connection: Connection, jwtSecret: string) {
    this.accountRepo = new AccountRepo(connection);
    this.worldRepo = new WorldRepo(connection);
    this.jwtVerifier = new JwtVerifier(jwtSecret);
  }

  readonly accountRepo: AccountRepo;
  readonly worldRepo: WorldRepo;
  readonly jwtVerifier: JwtVerifier;
}