import HookRegistration from "./HookRegistration";

const InputSwitchman: HookRegistration = ({ keyboard, mouse }) => {
  keyboard.register(({ keyboard, sender, log, event }) => {
    log("an event from the keyboard!", event);
    log("the keyboard event was sent from", sender);
    return "drop";
  });

  mouse.register(({ keyboard, log, event }) => {
    log("an event from the mouse!", event);
    log("im gonna invoke the keyboard!");
    keyboard.trigger({});
    return "pass";
  });
};

export default InputSwitchman;
