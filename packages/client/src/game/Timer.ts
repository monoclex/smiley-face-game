interface Event {
  schedule: number;
  run: () => void;
}

// some events are sensitive to being ran before or after certain code
// i would just use setTimeout() but that doesn't guarantee that other code on tick is being ran
// this fixes a bug with attempting to get dead bullet's sprite stuff because it dies in
// setTimeout but the code sitll runs for whatever reason
export default class Timer {
  events: Event[] = [];

  schedule(afterMs: number, run: () => void) {
    this.events.push({
      schedule: new Date().getTime() + afterMs,
      run: run,
    });
  }

  tick() {
    // but hard to follow but meh
    const now = new Date().getTime();

    while (this.events.length > 0) {
      const top = this.events[0];

      if (now >= top.schedule) {
        this.events.shift();
        top.run();
      } else {
        break;
      }
    }
  }
}
