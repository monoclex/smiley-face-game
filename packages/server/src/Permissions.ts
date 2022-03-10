// Make sure to update the default permissions below this enum if you add more permissions!
export enum Permission {
  TeleportPlayer,
  ControlEdit,
  ControlGod,
  KickPlayers,
  SaveWorld,
  LoadWorld,
  ClearWorld,
  Edit,
  God,
}

export const defaultOwnerPermissions = [
  Permission.TeleportPlayer,
  Permission.ControlEdit,
  Permission.ControlGod,
  Permission.KickPlayers,
  Permission.SaveWorld,
  Permission.LoadWorld,
  Permission.ClearWorld,
  Permission.Edit,
  Permission.God,
];

type P = Permission;

export default class Permissions {
  permissions: Set<P> = new Set();

  has(permission: P): boolean {
    return this.permissions.has(permission);
  }

  change(to: boolean, permission: P) {
    if (to) {
      this.give(permission);
    } else {
      this.take(permission);
    }
  }

  give(...permissions: P[]) {
    for (const permission of permissions) {
      this.permissions.add(permission);
    }
  }

  take(...permissions: P[]) {
    for (const permission of permissions) {
      this.permissions.delete(permission);
    }
  }
}
