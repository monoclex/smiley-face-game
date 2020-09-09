import EventSystem from "@/game/events/EventSystem";

/**
 * Functional hooks implement EventHook. This interface allows the user to deconstruct the event system to the required specific event
 * systems, and register handlers on them.
 *
 * When `EventSystem.registerHook()` is called, it will set some global state before calling this function, and the function will register
 * handlers and the handlers will know what hook called the register function due to the global state. This allows for the system to log
 * what event goes where, without being obtrusive in hook code.
 * 
 * Each hook when registering a handler may deconstruct on the passed handler data to talk to other event systems in the event system, or to
 * know what event hook sent the message, or to log something. An event hook also controls the flow of the event, as it can choose to pass the
 * message along or drop it by returing "pass" or "drop". An example EventHook is shown below:
 * 
 * ```
 * const MyHook: EventHook = ({ systemA, systemB }) => {
 *   systemA.register(({ systemB, event, sender, log }) => {
 *     log("System A got an event! event", event, "from sender", sender);
 *     log("Sending this to System B");
 *
 *     systemB.trigger({ sysAEvent: event, sysASender: sender });
 *     return "pass";
 *   });
 * 
 *   systemB.register(({ event, sender, log }) => {
 *     log("System B received System A's event from", sender);
 *     log("event:", event.sysAEvent, "from", event.sysASender);
 *     return "drop";
 *   })
 * };
 * ```
 */
export default interface EventHook {
  (eventSystem: EventSystem): void;
}