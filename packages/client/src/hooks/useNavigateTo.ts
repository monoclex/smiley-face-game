import React, { useEffect } from "react";
import { NavigateFunction, useNavigate } from "react-router";

type Callback = () => Promise<void>;

// TODO: i could try to get fancy and check "will this component unregister"
// but this is only needed for the scrolling lobby thing atm
const callbacks: Callback[] = [];

export default function useNavigateTo(): NavigateFunction {
  const navigate = useNavigate();

  return (...args) =>
    runCallbacks().then(() => {
      //@ts-expect-error yea not typing this lol
      navigate(...args);
    });
}

export function runCallbacks(): Promise<void> {
  let callback = Promise.resolve();

  for (const nextCallback of callbacks) {
    callback = callback.then(nextCallback);
  }

  return callback;
}

export function useBeforeNavigateTo(callback: Callback, deps?: React.DependencyList) {
  useEffect(() => {
    const index = callbacks.length;
    callbacks.push(callback);
    return () => void callbacks.splice(index, 1);
  }, deps);
}
