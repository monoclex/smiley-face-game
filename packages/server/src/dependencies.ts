import { Connection } from "typeorm";
import { typeCheckFor } from "ts-type-checked";
import AccountRepo from "@/database/repos/AccountRepo";
import WorldRepo from "@/database/repos/WorldRepo";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import AuthProvider from "@/jwt/payloads/AuthProvider";
import WorldPayload from "@/jwt/payloads/WorldPayload";
import WorldProvider from "@/jwt/payloads/WorldProvider";
import JwtVerifier from "@/jwt/JwtVerifier";
import RoomManager from "@/worlds/RoomManager";

export default class Dependencies {
  constructor(connection: Connection, jwtSecret: string) {
    this.accountRepo = new AccountRepo(connection);
    this.worldRepo = new WorldRepo(connection);

    this.authVerifier = new JwtVerifier(typeCheckFor<AuthPayload>(), jwtSecret);
    this.authProvider = new AuthProvider(jwtSecret);

    this.worldVerifier = new JwtVerifier(typeCheckFor<WorldPayload>(), jwtSecret);
    this.worldProvider = new WorldProvider(jwtSecret);

    this.roomManager = new RoomManager(this);
  }

  readonly accountRepo: AccountRepo;
  readonly worldRepo: WorldRepo;

  readonly authVerifier: JwtVerifier<AuthPayload>;
  readonly authProvider: AuthProvider;

  readonly worldVerifier: JwtVerifier<WorldPayload>;
  readonly worldProvider: WorldProvider;

  readonly roomManager: RoomManager;
}