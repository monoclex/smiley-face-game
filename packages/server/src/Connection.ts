import { ZSPacket } from "@smiley-face-game/api";
import { ZRole } from "@smiley-face-game/api/types";
import Permissions, { Permission } from "./Permissions";

export default class Connection {
  constructor(readonly hostConnection: HostConnection) {
    this.id = hostConnection.connectionId;
  }

  readonly id: number;

  readonly permissions: Permissions = new Permissions();

  /**
   * Do NOT use this for permission-based testing!
   * This should only be used to know whether this connection is a guest, and NOT
   * for gate-keeping functionality out. Use `permissions` to check for a permission
   * if you wish to perform gate-keeping.
   */
  get isGuest(): boolean {
    return this.hostConnection.userId === null;
  }

  /**
   * Do NOT use this for permission-based testing!
   * This should only be used to know whether this connection is the owner, and NOT
   * for gate-keeping functionality out. Use `permissions` to check for a permission
   * if you wish to perform gate-keeping.
   */
  get isOwner(): boolean {
    return this.hostConnection.isOwner;
  }

  get username(): string {
    return this.hostConnection.username;
  }

  send(packet: ZSPacket) {
    return this.hostConnection.send(JSON.stringify(packet));
  }

  kill(reason: string) {
    return this.hostConnection.close(reason);
  }

  get canEdit(): boolean {
    return this.permissions.has(Permission.Edit);
  }

  set canEdit(value: boolean) {
    this.permissions.change(value, Permission.Edit);
  }

  get canGod(): boolean {
    return this.permissions.has(Permission.God);
  }

  set canGod(value: boolean) {
    this.permissions.change(value, Permission.God);
  }

  /**
   * @deprecated This is to be removed in a future version, whenever Smiley Face Game
   * sends proper `permissions` values down the wire. For now though, it exists as I
   * don't want to perform a major entire-project-wide refactor.
   */
  get role(): ZRole {
    if (this.hostConnection.isOwner) {
      return "owner";
    }

    if (this.canEdit) {
      return "edit";
    }

    return "non";
  }

  // --- TODO CLEAN ---

  // room things
  // TODO: decouple 'lastPosition' default state
  lastPosition: { x: number; y: number } = { x: 16, y: 16 };
  hasGun = false;
  gunEquipped = false;
  lastMessage: Date = new Date();
  messagesCounter = 0; // counts how many messages have been sent in a row with a close enough `Date` to eachother
  get canPlaceBlocks(): boolean {
    return this.canEdit && (this.hasGun ? !this.gunEquipped : true);
  }
  inGod = false;
}
