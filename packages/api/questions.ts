export interface Unbind {
  (): void;
}

export interface AllQuestions {
  [question: string]: any;
}

/**
 * Similar to `nanoevents`, except there's only one known receiver and that receiver will give a response.
 */
export class Questioner<Qs extends AllQuestions> {
  qs: Partial<Qs> = {};

  ask<Q extends keyof Qs>(question: Q, ...args: Parameters<Qs[Q]>): ReturnType<Qs[Q]> {
    const handler = (this.qs as Qs)[question];
    if (!handler) throw new Error(`The quetion "${question}" has not been bound to a handler!`);
    return handler(...args);
  }

  bind<Q extends keyof Qs>(question: Q, handler: Qs[Q]): Unbind {
    if (question in this.qs) throw new Error(`The question "${question}" is already bound!`);
    this.qs[question] = handler;
    return () => delete this.qs[question];
  }
}
