/**
 * @description We have nano events as a module because the nanoevents package
 * does not provide CommonJS builds. We want the SFG package to be as painless
 * to import on Node as possible.
 */

export let createNanoEvents = () => ({
  events: {},
  emit(event, ...args) {
    (this.events[event] || []).forEach((i) => i(...args));
  },
  on(event, cb) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () => (this.events[event] = (this.events[event] || []).filter((i) => i !== cb));
  },
});
