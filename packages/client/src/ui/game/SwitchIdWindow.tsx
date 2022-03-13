import React, { useEffect, useRef, useState } from "react";
import { useControls, useMutableVariable, useReactEvent } from "@/hooks";
import { SWITCH_ID_MAX, SWITCH_ID_MIN } from "@smiley-face-game/api/types";
import { currentSwitchId, draggingSwitchWindow } from "@/state";
import useKeyboard from "@/hooks/useKeyboard";
import { Grid, IconButton, styled, Typography, SvgIcon } from "@mui/material";
import { DragHorizontal, Plus, Minus } from "mdi-material-ui";
import { formatKeyBindingName } from "@/controls";

const FloatingWindow = styled(Grid)({
  position: "absolute",
  // TODO: encapsulate this style somewhere
  backgroundColor: "rgb(123,123,123)",
  padding: "0.25em",
  borderRadius: "4px",
  borderWidth: "0px",
});

const GrabbableBar = styled(Grid)({
  cursor: "grabbing",
});

const CenteredTypography = styled(Typography)({
  textAlign: "center",
});

const originalPosition = { x: 0, y: 0 };
const dragPosition = { x: 0, y: 0 };
export default function SwitchIdWindow() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useMutableVariable(currentSwitchId, 0);

  useReactEvent("toggleSwitchWindow", (state) => {
    setOpen(state);

    if (!state) {
      draggingSwitchWindow.value = false;
    }
  });

  const increment = () => value < SWITCH_ID_MAX && setValue((value) => value + 1);
  const decrement = () => value > SWITCH_ID_MIN && setValue((value) => value - 1);

  const controls = useControls();
  useKeyboard(controls.increment.binding, () => open && increment());
  useKeyboard(controls.decrement.binding, () => open && decrement());

  const floatingWindow = useRef<HTMLDivElement>(null);
  const grabbableBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const it = floatingWindow.current;
    if (!it) return;

    const grab = grabbableBar.current;
    if (!grab) return;

    it.style.display = open ? "unset" : "none";
    it.style.top = `${originalPosition.y}px`;
    it.style.left = `${originalPosition.x}px`;

    grab.onmousedown = (e) => {
      dragPosition.x = e.clientX;
      dragPosition.y = e.clientY;
      originalPosition.x = it.offsetLeft;
      originalPosition.y = it.offsetTop;
      draggingSwitchWindow.value = true;
    };

    grab.onmouseup = () => {
      draggingSwitchWindow.value = false;
      originalPosition.x = it.offsetLeft;
      originalPosition.y = it.offsetTop;
    };

    const moveHandler = (e: MouseEvent) => {
      if (!draggingSwitchWindow.value) return;
      it.style.top = `${originalPosition.y + (e.clientY - dragPosition.y)}px`;
      it.style.left = `${originalPosition.x + (e.clientX - dragPosition.x)}px`;
    };

    document.addEventListener("mousemove", moveHandler);
    return () => document.removeEventListener("mousemove", moveHandler);
  }, [floatingWindow, open]);

  if (!open) return null;

  return (
    <FloatingWindow ref={floatingWindow} direction="column">
      <GrabbableBar ref={grabbableBar} container item xs justifyContent="center">
        <Grid item>
          <DragHorizontal />
        </Grid>
      </GrabbableBar>
      <Grid container item spacing={1} columns={3}>
        <LabelledSwitchButton
          onClick={decrement}
          icon={Minus}
          binding={controls.decrement.binding}
        />
        <Grid container item xs={1} justifyContent="center" alignItems="center">
          <Grid item>
            <CenteredTypography variant="h4">{value}</CenteredTypography>
          </Grid>
        </Grid>
        <LabelledSwitchButton
          onClick={increment}
          icon={Plus}
          binding={controls.increment.binding}
        />
      </Grid>
    </FloatingWindow>
  );
}

interface LabelledSwitchButtonProps {
  onClick: () => void;
  icon: typeof SvgIcon;
  binding: string;
}

function LabelledSwitchButton({ onClick, icon, binding }: LabelledSwitchButtonProps) {
  return (
    <Grid item direction="column" xs={1} alignItems="center">
      <Grid container item justifyContent="center">
        <Grid item>
          <CenteredTypography variant="caption">{formatKeyBindingName(binding)}</CenteredTypography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item>
          <SmallIconButton onClick={onClick} icon={icon} />
        </Grid>
      </Grid>
    </Grid>
  );
}

interface SmallIconButtonProps {
  onClick: () => void;
  icon: typeof SvgIcon;
}

function SmallIconButton({ onClick, icon: Icon }: SmallIconButtonProps) {
  return (
    <IconButton size="small" onClick={onClick}>
      <Icon />
    </IconButton>
  );
}
