import markUsed from "./markUsed";
import Server from "./Server";

markUsed(initialize, onConnect, onDisconnect, onMessage, healthCheck);

// server logic

let server!: Server;

function initialize(hostRoom: HostRoom, initialWorldData: HostWorldData) {
  server = new Server(hostRoom, initialWorldData);
}

function onConnect(hostConnection: HostConnection) {
  server.onConnect(hostConnection);
}

function onDisconnect(connectionId: number) {
  server.onDisconnect(connectionId);
}

function onMessage(connectionId: number, message: string, sent: number) {
  return server.onMessage(connectionId, message, sent);
}

function healthCheck() {
  // TODO(host-api): compare information that the host knows to what we know, so things
  //   like how many clients are connected, etc.
}
