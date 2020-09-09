import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import HookRegistration from "../hooks/HookRegistration";
import { NetworkClient } from "../../../../../api/src/NetworkClient";

type NetworkEvent = WorldPacket;

export default class NetworkSystem extends System<NetworkEvent> {
  networkClient!: NetworkClient;

  constructor(readonly eventSystem: EventSystem) {
    super(eventSystem, NetworkSystem.name);
  }
  
  initialize({ networkClient }: Deps): void {
    this.networkClient = networkClient;

    const NetworkClientSender = () => {};
    this.networkClient.events.hookLeftover((message) => {
      //@ts-ignore
      this.trigger(message, NetworkClientSender)
    });
    
    const ClientPacketHook: HookRegistration = ({ network }) => {
      network.register(({ network, event, sender }) => {
        if (sender === NetworkClientSender) {
          // we received a packet - that means it's for everyone else to handle
          return "pass";
        }
        else {
          // this is a packet from our client - send it to the network client
          network.networkClient.send(event);
          return "drop";
        }
      }, false);
    };

    this.eventSystem.registerHook(ClientPacketHook);
  }
}