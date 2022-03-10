declare const host: HostObject;

declare class HostPromise<T> {
  ToPromise(): Promise<T>;
}

declare class HostObject {
  broadcast(send: string);
  broadcastExcept(send: string, exceptConnectionId: number);
  loadWorld(): HostPromise<HostWorldData>;
  saveWorld(worldData: HostWorldData): HostPromise<void>;
  signalKill(): void;
}

declare class HostWorldData {
  readonly worldDataVersion: number;
  readonly worldData: string;
}

declare class HostConnection {
  readonly connectionId: number;
  readonly userId: string | null;
  readonly username: string;
  readonly isOwner: boolean;

  send(data: string);
  close(reason: string);
}

declare class HostRoom {
  readonly id: string;

  readonly isSavedRoom: boolean;
  readonly isDynamicRoom: boolean;

  readonly name: string;
  readonly ownerId: string | null;
  readonly ownerUsername: string;
  readonly width: number;
  readonly height: number;
}
