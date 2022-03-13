import { SetStateAction, Dispatch, useState } from "react";

/**
 * A transparent proxy to `useState`. Unlike `useState`, this will always force
 * re-renders on any value change.
 *
 * The implementation of this function achieves this by wrapping the value in an
 * object. This forces an equality comparison to use referential equality, which
 * will always test false.
 */
export default function useUncachedState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  const [{ value }, rawSet] =
    initialState instanceof Function
      ? useState(() => ({ value: initialState() }))
      : useState({ value: initialState });

  return [
    value,
    (action: SetStateAction<S>) => {
      return action instanceof Function
        ? rawSet(({ value }) => ({ value: action(value) }))
        : rawSet({ value: action });
    },
  ];
}
