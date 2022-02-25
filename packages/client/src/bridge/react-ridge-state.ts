// basically the module on node is only for CommonJS so we bundle it ourselves
// that way we can bundle it with esmodule support just fine

/*
MIT License

Copyright (c) 2020 WebRidge Design

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// https://raw.githubusercontent.com/web-ridge/react-ridge-state/main/src/index.ts

import { useState, useRef, useLayoutEffect, useEffect, SetStateAction } from "react";

type Set<T> = (
  newState: SetStateAction<T>, // can be the newState or a function with prevState in params and which needs to return new state
  callback?: (newState: T) => void // callback with the newState after state has been set
) => void;

type UseSelector<T> = <TSelected = unknown>(
  selector: (state: T) => TSelected,
  equalityFn?: Comparator<TSelected>
) => TSelected;

export interface StateWithValue<T> {
  use: () => [T, Set<T>];
  useValue: () => T;
  get: () => T;
  useSelector: UseSelector<T>;
  set: Set<T>;
  reset: () => void;
  subscribe(subscriber: SubscriberFunc<T>): () => void;
}

type SubscriberFunc<T> = (newState: T, previousState: T) => void;

interface Options<T> {
  onSet?: SubscriberFunc<T>;
}

type Comparator<TSelected = unknown> = (a: TSelected, b: TSelected) => boolean;

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" || typeof document !== "undefined" ? useLayoutEffect : useEffect;

const equ: Comparator = (a, b) => a === b;

const FR = {}; // an opaque value
function useComparator<T>(v: T, c: Comparator<T> = equ): T {
  const f = useRef(FR as T);
  let nv = f.current;

  useIsomorphicLayoutEffect(() => {
    f.current = nv;
  });

  if (f.current === FR || !c(v, f.current)) {
    nv = v;
  }

  return nv;
}

export function newRidgeState<T>(initialValue: T, options?: Options<T>): StateWithValue<T> {
  // subscribers with callbacks for external updates
  let sb: SubscriberFunc<T>[] = [];

  // internal value of the state
  let v: T = initialValue;

  // set function
  function set(newValue: SetStateAction<T>, callback?: SubscriberFunc<T>) {
    const pv = v;
    // support previous as argument to new value
    v = newValue instanceof Function ? newValue(v) : newValue;

    // let subscribers know value did change async
    setTimeout(() => {
      // call subscribers
      sb.forEach((c) => c(v, pv));

      // callback after state is set
      callback?.(v, pv);

      // let options function know when state has been set
      options?.onSet?.(v, pv);
    });
  }

  // subscribe function; returns unsubscriber function
  function subscribe(subscriber: SubscriberFunc<T>): () => void {
    sb.push(subscriber);
    return () => {
      sb = sb.filter((f) => f !== subscriber);
    };
  }

  // subscribe hook
  function useSubscription(subscriber: SubscriberFunc<T>) {
    // subscribe effect
    useIsomorphicLayoutEffect(() => subscribe(subscriber), [subscriber]);
  }

  // use hook
  function use(): [T, Set<T>] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [l, s] = useState<T>(v);

    // subscribe to external changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSubscription(s);

    // set callback
    return [l, set];
  }

  // select hook
  function useSelector<TSelected = unknown>(
    selector: (state: T) => TSelected,
    comparator: Comparator<TSelected> = equ
  ): TSelected {
    const [rv] = use();
    return useComparator(selector(rv), comparator);
  }

  return {
    use,
    useSelector,
    useValue: () => use()[0],
    get: () => v,
    set,
    reset: () => set(initialValue),
    subscribe,
  };
}
