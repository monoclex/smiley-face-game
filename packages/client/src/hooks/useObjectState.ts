import { Dispatch, SetStateAction, useState } from "react";
import equal from "fast-deep-equal";

/**
 * A transparent proxy to `useState`. Unlike `useState`, this will perform deep
 * equality on the objects to check if they're equal before performing state updates.
 *
 * The implementation of this function achieves this by using `fast-deep-equal` to
 * perform deep object equality, and also by returning the old value or not calling
 * the setter in the event that the objects are equaal to prevent excess updates.
 */
export default function useObjectState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [value, set] = useState(initialState);

  return [
    value,
    (action: SetStateAction<S>) => {
      if (action instanceof Function) {
        set((value) => {
          const newValue = action(value);
          return equal(value, newValue) ? value : newValue;
        });
      } else {
        if (!equal(value, action)) set(action);
      }
    },
  ];
}
