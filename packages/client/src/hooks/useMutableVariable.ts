import { MutableVariable } from "@/util";
import { useState } from "react";

/**
 * Small wrapper to synchronize a local state variable with a global `MutableVariable<T>`.
 * There should only ever be one React component that wishes to update a `MutableVariable<T>`,
 * otherwise it could lead to weirdness.
 */
export default function useMutableVariable<T>(
  mutableVariable: MutableVariable<T>,
  initialValue: T | (() => T)
) {
  const [state, setState] = useState(initialValue);
  mutableVariable.value = state;
  return [state, setState] as const;
}
