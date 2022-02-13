//@ts-check
import React, { useEffect, useState } from "react";
import { styled } from "@mui/material";
import { Joystick } from "react-joystick-component";
import state from "../../bridge/state";
import MobileDetect from "mobile-detect";
const mobileDetect = new MobileDetect(navigator.userAgent);

const JoystickContainer = styled("div")({
  pointerEvents: "all",
});

const notMoving = { up: false, right: false, down: false, left: false };

export default function MobileControls() {
  if (typeof mobileDetect.mobile() !== "string") return null;

  // lololo have fun
  const [moving, setMoving] = useState(notMoving);

  useEffect(() => {
    if (!state.keyboard) return;

    // TODO: maybe have a "jump" button?
    state.keyboard.simulateKey(" ", moving.up);
    state.keyboard.simulateKey("w", moving.up);
    state.keyboard.simulateKey("a", moving.left);
    state.keyboard.simulateKey("s", moving.down);
    state.keyboard.simulateKey("d", moving.right);
  }, [moving]);

  return (
    <JoystickContainer>
      <Joystick
        size={100} // TODO: figure out appropriate size based on device size
        stop={() => {
          setMoving(notMoving);
        }}
        move={({ x, y }) => {
          x = x ?? 0;
          y = y ?? 0;

          // we want to let users run and jump if the joystick is held diagonally, so to do that
          // we setup some overlapping lines and check if the points are in them
          //
          // check the following graph for how this works
          // https://www.desmos.com/calculator/7gxzfriivi
          // if the link breaks, just note this:

          // for all of these cases, we make sure the joystick is at least 30 units out (out of 50) to prevent
          // the "annoying scenario" where the user is going in a direction they didn't actually want to
          //
          // pythagoream thoerem:
          // we must ensure x^2 + y^2 >= 30^2

          if (x * x + y * y < 30 * 30) {
            return;
          }

          // see the desmos link
          // these are the regions the x/y must be in
          const goRight = y < 2 * x && y > -2 * x;
          const goLeft = y > 2 * x && y < -2 * x;
          const goUp = y > -x / 2 && y > x / 2;
          const goDown = y < -x / 2 && y < x / 2;

          const newMoving = {
            right: goRight,
            left: goLeft,
            up: goUp,
            down: goDown,
          };

          setMoving(newMoving);
        }}
      />
    </JoystickContainer>
  );
}
