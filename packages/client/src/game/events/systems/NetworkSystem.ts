/**
 * @description The Network System is responsible for dispatching message received from the network to registered event hooks, and from passing
 * dispatched messages from event hooks upstream to the network.
 * This is done by having the very first hook that is registered act as a "gateway", for allowing messages sent from the network client pass
 * on down the chain and from sending messages not from the network client upstream.
 */

import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import EventHook from "../EventHook";
import { NetworkClient } from "../../../../../api/src/NetworkClient";

type NetworkEvent = WorldPacket;

export default class NetworkSystem extends System<NetworkEvent> {
  networkClient!: NetworkClient;

  constructor(readonly eventSystem: EventSystem) {
    super(eventSystem, NetworkSystem.name);
  }
  
  initialize({ networkClient }: Deps): void {
    this.networkClient = networkClient;

    // used to determine if the sender of a message is another hook or the networ kclient
    const NetworkClientSender = () => {};

    // TODO: need to convert all events to use this system
    this.networkClient.events.hookLeftover((message) => {
      //@ts-ignore
      this.trigger(message, NetworkClientSender)
    });
    
    /** The gateway hook. Sends messages from the network client down, sends messages from other hooks up. */
    const ClientPacketHook: EventHook = ({ network }) => {
      network.register(({ network, event, sender }) => {
        if (sender === NetworkClientSender) {
          // we received a packet - that means it's for everyone else to handle
          return "pass";
        }
        else {
          // this is a packet from our client - send it to the network client
          network.networkClient.send(event);
          return "drop"; // don't want downstream hooks to receive messages being sent
        }
      }, false);
    };

    this.eventSystem.registerHook(ClientPacketHook);
  }
}