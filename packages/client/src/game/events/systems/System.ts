import HookRegistration from "@/game/events/hooks/HookRegistration";
import EventSystem from "@/game/events/EventSystem";

type EventHandleResult = "pass" | "drop";
type Payload<TEvent> = EventSystem & { event: TEvent } & { sender: unknown };
type EventHandler<TEvent> = (payload: Payload<TEvent>) => EventHandleResult;

export default abstract class System<TEvent, TDeps = {}> {
  private readonly _handlers: EventHandler<TEvent>[] = [];

  constructor(
    readonly systems: EventSystem,
    readonly name: string,
  ) {}

  abstract initialize(deps: TDeps): void;

  register(handler: EventHandler<TEvent>): void {
    let systems = this.systems;
    let hook = this.systems.activeHook;
    let name = this.name;
    const realLog = systems.log;
    const hookLog = (...args: unknown[]) => realLog(name, ">", hook!.name, ">", ...args);
    const invokingHookLog = (...args: unknown[]) => hookLog("log >", ...args);

    this._handlers.push((payload) => {
      hookLog("payload", payload);

      systems.sender = hook;
      systems.log = invokingHookLog;
      const result = handler(payload);
      systems.log = realLog;

      hookLog("result", result);
      return result;
    });
  }

  trigger(event: TEvent): EventHandleResult;
  trigger(event: TEvent, sender: HookRegistration): EventHandleResult;
  trigger(event: TEvent, actualSender?: HookRegistration) {
    const sender = actualSender ?? this.systems.sender;

    if (!sender) {
      console.trace(
`Event system 'trigger' called without a sender.
This most likely means the event came from an outside source.
If you call 'trigger' from the outside world, make sure to specify the 'useSender' parameter.`);
    }

    const payload = { ...this.systems, sender, event };

    for (const handler of this._handlers) {
      if (handler(payload) === "drop") {
        this.systems.sender = null!;
        return "drop";
      }
    }

    this.systems.sender = null!;
    return "pass";
  }
}
