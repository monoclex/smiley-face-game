import { Connection } from "typeorm";
import AccountRepo from "./database/repos/AccountRepo";
import WorldRepo from "./database/repos/WorldRepo";
import AuthPayload from "./jwt/payloads/AuthPayload";
import AuthProvider from "./jwt/payloads/AuthProvider";
import JwtVerifier from "./jwt/JwtVerifier";
import RoomManager from "./worlds/RoomManager";
import UuidGenerator from "./UuidGenerator";
import ValidateAuthPayload from "./jwt/ValidateAuthPayload";

export default class Dependencies {
  constructor(connection: Connection, jwtSecret: string) {
    this.uuidGenerator = new UuidGenerator();

    this.accountRepo = new AccountRepo(connection);
    this.worldRepo = new WorldRepo(connection);

    this.authVerifier = new JwtVerifier(ValidateAuthPayload, jwtSecret);
    this.authProvider = new AuthProvider(jwtSecret);

    this.roomManager = new RoomManager(this);
  }

  readonly uuidGenerator: UuidGenerator;

  readonly accountRepo: AccountRepo;
  readonly worldRepo: WorldRepo;

  readonly authVerifier: JwtVerifier<AuthPayload>;
  readonly authProvider: AuthProvider;

  readonly roomManager: RoomManager;
}
