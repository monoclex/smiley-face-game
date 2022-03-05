import type React from "react";
import { useEffect, useState } from "react";

export type ControlKey = "left" | "up" | "right" | "down" | "jump" | "god" | "inspect";

export const defaultControls: Controls<ControlKey> = {
  left: {
    name: "Move Left",
    binding: "a",
  },
  right: {
    name: "Move Right",
    binding: "d",
  },
  up: {
    name: "Move Up",
    binding: "w",
  },
  down: {
    name: "Move Down",
    binding: "s",
  },
  jump: {
    name: "Jump",
    binding: " ",
  },
  god: {
    name: "God Mode",
    binding: "f",
  },
  inspect: {
    name: "Inspect Block",
    binding: "i",
  },
};

export type Controls<K extends string> = Record<K, Control>;

export interface Control {
  name: string;
  binding: string;
}

export function updateBinding<K extends string>(
  controls: Controls<K>,
  key: K,
  binding: string
): Controls<K> {
  return { ...controls, [key]: { ...controls[key], binding } };
}

export function useControlBindings(): [
  Controls<ControlKey>,
  React.Dispatch<React.SetStateAction<Controls<ControlKey>>>
] {
  const [value, setValue] = useState(loadControls);

  useEffect(() => {
    localStorage.setItem("controlBindings", JSON.stringify(value));
  }, [value]);

  return [value, setValue];
}

export function loadControls(): Controls<ControlKey> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = localStorage.getItem("controlBindings")!;
    const parsed = JSON.parse(item);
    if (!parsed) throw new Error();
    const controls = parsed as Controls<ControlKey>;

    for (const [rawKey, value] of Object.entries(defaultControls)) {
      const key = rawKey as ControlKey;

      if (!controls[key]) {
        controls[key] = value;
      }
    }

    return controls;
  } catch {
    return defaultControls;
  }
}
