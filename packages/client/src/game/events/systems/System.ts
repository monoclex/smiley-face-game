/**
 * @description This is the class primarily responsible for implementing each individual system.
 * Sub-systems will inherit from this class to get their functionality done. This class:
 * 
 * - handles registering events, setting global state on the current event system to facilitate a better experience (`sender`, `log`, etc.)
 * - controls message passing when an event is triggered
 * - debug messages incase something is used incorrectly
 */

import EventHook from "@/game/events/EventHook";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";

type EventHandleResult = "pass" | "drop"; // reuse
type Payload<TEvent> = EventSystem & { event: TEvent }; // & { event } so that hooks can deconstruct on the current event
type EventHandler<TEvent> = (payload: Payload<TEvent>) => EventHandleResult; // simplify type signature

/**
 * The base class for implementing a system. Implementors of this class should be expected to create a constructor that
 * hides the second `name` parameter by specifying the name of the system.
 */
export default abstract class System<TEvent> {
  private readonly _handlers: EventHandler<TEvent>[] = [];

  constructor(
    readonly systems: EventSystem,
    readonly name: string, // makes for easier logs/debugging
  ) {}

  abstract initialize(deps: Deps): void;

  /**
   * Registers an event handler. Consider setting `silent` to true of the event handler may be extra noisy, or be responsible for sending
   * lots of events.
   * @param handler The event handler to register.
   * @param silent Whether logging is enabled for this hook
   */
  register(handler: EventHandler<TEvent>, silent: boolean = false): void {
    if (!silent) {
      this._handlers.push(handler);
    }
    else {
      // in case `this` isn't available for some reason
      let systems = this.systems;
      let hook = this.systems.activeHook; // 'activeHook' is set during `EventSystem.registerHook`. allows us to get the name
      let name = this.name;
      const realLog = systems.log;
      const hookLog = (...args: unknown[]) => realLog(name, ">", hook!.name, ">", ...args);
      const invokingHookLog = (...args: unknown[]) => hookLog("log >", ...args);

      this._handlers.push((payload) => {
        hookLog("payload", payload);
  
        // mutate the log function for enhanced debugging during invocation
        systems.log = invokingHookLog;
        const result = handler(payload);
        systems.log = realLog;
  
        hookLog("result", result);
        return result;
      });
    }
  }

  /**
   * From within the context of an EventHook, this will immediately trigger the system to handle the message, with the sender being the current
   * hook.
   * Calling this function from outside of an EventHook is an error. Consider the overload with a sender.
   * @param event The event to pass down to all registered handlers on this system.
   */
  trigger(event: TEvent): EventHandleResult;

  /**
   * Immediately triggers the system to handle the message, with the specified sender. This is only to be used if not within the context of an
   * event hook.
   * Calling this function from inside an EventHook is malpractice. Consider doing something else.
   * @param event The event to pass down to all registered handlers on this system.
   * @param sender The sender to use while passing it down.
   */
  trigger(event: TEvent, sender: Function): EventHandleResult;

  /** Implementation specific. */
  trigger(event: TEvent, actualSender?: Function) {
    const sender = actualSender ?? this.systems.sender;

    if (!sender) {
      console.trace(
`Event system 'trigger' called without a sender.
This most likely means the event came from an outside source.
If you call 'trigger' from the outside world, make sure to specify the 'sender' parameter.`);
    }

    const payload = { ...this.systems, sender, event };

    for (const handler of this._handlers) {
      // before we call the handler, we should inform it what originally sent the event
      this.systems.sender = sender;
      if (handler(payload) === "drop") {
        this.systems.sender = null!; // cleaning this out so that there's no "stale sender" bug in the future
        return "drop";
      }
    }

    this.systems.sender = null!; // cleaning this out so that there's no "stale sender" bug in the future
    return "pass";
  }
}
