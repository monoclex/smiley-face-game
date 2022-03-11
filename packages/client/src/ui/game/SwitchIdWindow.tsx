import React, { useState } from "react";
import { useMutableVariable, useReactEvent } from "@/hooks";
import { SWITCH_ID_MAX, SWITCH_ID_MIN } from "@smiley-face-game/api/types";
import { currentSwitchId } from "@/state";

export default function SwitchIdWindow() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useMutableVariable(currentSwitchId, 0);

  useReactEvent("toggleSwitchWindow", (state) => setOpen(state));

  const increment = () => value < SWITCH_ID_MAX && setValue((value) => value + 1);
  const decrement = () => value > SWITCH_ID_MIN && setValue((value) => value - 1);

  if (!open) return null;

  return (
    <>
      <button onClick={increment}>add one</button>
      <button onClick={decrement}>subtract one</button>
      current is {value}
    </>
  );
}
