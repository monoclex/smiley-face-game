//@ts-check
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { Joystick } from "react-joystick-component";
import InputPipe from "../../game/input/InputPipe";

// this entire file is probably a bit confusing to read because i tried to code it in a way that made it small for no good reason
// then i just kinda stopped and pasted code around and bleh

const useStyles = makeStyles({
  joystick: {
    pointerEvents: "all",
  },
});

function invokeInputPipe(value: -1 | 1, key: "right" | "up" | "left") {
  switch (key) {
    case "right":
      return InputPipe.addRight(value);
    case "up":
      return InputPipe.addUp(value);
    case "left":
      return InputPipe.addLeft(value);
  }
}

export default () => {
  // lololo have fun
  const classes = useStyles();
  const [moving, setMoving] = useState({
    up: false,
    left: false,
    right: false,
  });

  return (
    <div className={classes.joystick}>
      <Joystick
        size={100} // TODO: figure out appropriate size based on device size
        stop={() => {
          // if the joystick stops, teardown the current movement
          for (const key in moving) {
            //@ts-ignore
            if (moving[key]) {
              //@ts-ignore
              invokeInputPipe(-1, key);
            }
          }

          setMoving({ up: false, right: false, left: false });
        }}
        move={({ x, y }) => {
          // this happens to be a very clean way of doing this
          // first: teardown things according to the current moving object
          for (const key in moving) {
            //@ts-ignore
            if (moving[key]) {
              //@ts-ignore
              invokeInputPipe(-1, key);
            }
          }

          x ||= 0;
          y ||= 0;

          // then, rebuild our current movements from what's currently enabled
          // we want to let users run and jump if the joystick is held diagonally, so to do that
          // we setup some overlapping lines and check if the points are in them
          //
          // check the following graph for how this works
          // https://www.desmos.com/calculator/sp7rstyedj
          // if the link breaks, just note this:

          // for all of these cases, we make sure the joystick is at least 30 units out (out of 50) to prevent
          // the "annoying scenario" where the user is going in a direction they didn't actually want to

          // pythagoream thoerem:
          // we must ensure x^2 + y^2 >= 30^2
          const newMoving =
            x * x + y * y < 30 * 30
              ? { right: false, left: false, up: false }
              : {
                  // for the player to move right, the coordinate must be within the lines y=2x and y=-2x for x > 0
                  right: x > 0 && y < 2 * x && y > -2 * x,
                  // for the player to move left, the coordinate must be within the lines y=2x and y=-2x for x < 0
                  left: x < 0 && y > 2 * x && y < -2 * x,
                  // for the player to be jumping, the coordinate must be within the lines y=x/2 and y=-x/2 for y > 0
                  up: y > 0 && (x < 0 ? -x / 2 < y : true) && (x > 0 ? y > x / 2 : true),
                };

          // apply new current joystick state
          for (const key in newMoving) {
            //@ts-ignore
            if (newMoving[key]) {
              //@ts-ignore
              invokeInputPipe(1, key);
            }
          }

          setMoving(newMoving);
        }}
      />
    </div>
  );
};
