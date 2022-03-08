import { TileLayer } from "@smiley-face-game/api";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";
import createRegistration from "@smiley-face-game/api/tiles/createRegistration";
import Connection from "./worlds/Connection";
import Room from "./worlds/Room";

// prevent es-build from screwing us over
const markUsed = (..._: any[]) => {};
markUsed(generateBlankWorld, initialize, onConnect, onDisconnect, onMessage, healthCheck);

const tiles = createRegistration();

function generateBlankWorld(width: number, height: number): string {
  const world = new WorldLayer(0);
  world.putBorder(width, height, TileLayer.Foreground, tiles.id("basic-white"));
  return JSON.stringify(world.state);
}

// server logic

let room!: Room;

function initialize(hostRoom: HostRoom, initialWorldData: HostWorldData) {
  room = new Room(hostRoom);
  room.run(initialWorldData);
}

const clients = new Map<HostConnection, Connection>();

function onConnect(hostConnection: HostConnection) {
  const connection = new Connection(hostConnection);
  clients.set(hostConnection, connection);
  room.join(connection);
}

function onDisconnect(hostConnection: HostConnection) {
  const client = clients.get(hostConnection);
  if (!client) throw new Error("Could not find client for host connection!");
  room.leave(client);
}

async function onMessage(connection: HostConnection, message: string) {
  const client = clients.get(connection);
  if (!client) throw new Error("Could not find client!");

  const payload = JSON.parse(message);
  const packet = room.validateWorldPacket.parse(payload);
  await room.onMessage(client, packet);
}

function healthCheck() {
  // TODO(host-api): compare information that the host knows to what we know, so things
  //   like how many clients are connected, etc.
}
