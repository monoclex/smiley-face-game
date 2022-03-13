import { ReactMutableVariable } from "@/util";
import { useState } from "react";

/**
 * Small wrapper to synchronize a local state variable with a global `ReactMutableVariable<T>`.
 * There should only ever be one React component that wishes to update a `ReactMutableVariable<T>`,
 * otherwise it could lead to weirdness.
 */
export default function useReactMutableVariable<T>(
  reactMutableVariable: ReactMutableVariable<T>,
  initialValue: T | (() => T)
) {
  const [state, setState] = useState(initialValue);
  reactMutableVariable.bind(setState);
  return [state, setState] as const;
}
