// "stolen" from myself :) https://stackoverflow.com/a/69931123/3780113
import React, { useLayoutEffect } from "react";
const isDebugMode = import.meta.env.SERVER_MODE === "localhost";

const teardowns: (() => void)[] = [];

export function runTeardowns() {
  const wiped = teardowns.splice(0, teardowns.length);

  for (const teardown of wiped) {
    teardown();
  }
}

type Teardown = { registered?: boolean; called?: boolean; pushed?: boolean } & (() => unknown);

const cache: Map<string, Teardown> = new Map();

/**
 * Guarantees a function to run on teardown, even when errors occur.
 *
 * This is necessary because `useEffect` only runs when the component doesn't throw an error.
 * If the component throws an error before anything renders, then `useEffect` won't register a
 * cleanup handler to run. This hook **guarantees** that a function is called when the component ends.
 *
 * This works by telling `ErrorBoundary` that we have a function we would like to call on teardown.
 * However, if we register a `useEffect` hook, then we don't tell `ErrorBoundary` that.
 */
export default function useTeardown(performTeardown: Teardown, deps: React.DependencyList, name: string) {
  // We have state we need to maintain about our teardown that we need to persist
  // to other layers of the application. To do that, we store state on the callback
  // itself - but to do that, we need to guarantee that the callback is stable. We
  // achieve this by caching the teardown function by name.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const teardown = cache.get(name) ?? cache.set(name, performTeardown).get(name)!;

  // Here, we register a `useEffect` hook to run. This will be the "happy path" for
  // our teardown function, as if the component renders, we can let React guarantee
  // us for the cleanup function to be ran.
  useLayoutEffect(() => {
    // If the effect gets called, that means we can rely on React to run our cleanup
    // handler.
    teardown.registered = true;

    return () => {
      if (isDebugMode) {
        // We want to ensure that this impossible state is never reached. When the
        // `runTeardowns` function is called, it should only be ran for teardowns
        // that have not been able to be hook into `useEffect`.
        if (teardown.called) {
          console.warn("teardown already called, but unregistering in useEffect");
          return;
        }
      }

      teardown();
      cache.delete(name);

      if (isDebugMode) {
        // Because `teardown.registered` will already cover the case where the effect
        // handler is in charge of running the teardown, this isn't necessary. However,
        // this helps us prevent impossible states.
        teardown.called = true;
      }
    };
  }, deps);

  // Here, we register the "sad path". If there is an exception immediately thrown,
  // then the `useEffect` cleanup handler will never be ran.
  //
  // We rely on the behavior that our custom `ErrorBoundary` component will always
  // be rendered in the event of errors. Thus, we expect that component to call
  // `runTeardowns` whenever it deems it appropriate to run our teardowns.

  // Because `useTeardown` will get called multiple times, we want to ensure we only
  // register the teardown once.
  if (!teardown.pushed) {
    teardown.pushed = true;

    teardowns.push(() => {
      const useEffectWillCleanUpTeardown = teardown.registered;

      if (!useEffectWillCleanUpTeardown) {
        if (isDebugMode) {
          // If the useEffect handler was already called, there should be no way to
          // re-run this teardown. The only way this impossible state can be reached
          // is if a teardown is called multiple times, which should not happen during
          // normal execution.
          const teardownAlreadyCalled = teardown.called;
          if (teardownAlreadyCalled) throw new Error("teardown already called yet running it in runTeardowns");
        }

        teardown();
        cache.delete(name);

        if (isDebugMode) {
          // Notify that this teardown has been called - useful for ensuring that we
          // cannot reach any impossible states.
          teardown.called = true;
        }
      }
    });
  }
}
