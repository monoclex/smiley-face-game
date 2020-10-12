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

const actionMap = {
  FORWARD: 2,
  LEFT: 0,
  RIGHT: 1,
  // TODO: replace with "down"?
  BACKWARD: 3,
};

export default () => {
  // lololo have fun
  const classes = useStyles();
  const { addLeft, addRight, addJump } = InputPipe;
  const actions = [addLeft, addRight, addJump, () => {}];
  const [lastDirection, setLastDirection] = useState<undefined | number>();

  return (
    <div className={classes.joystick}>
      <Joystick
        size={100} // TODO: figure out appropriate size based on device size
        move={({ direction }) => {
          if (direction !== null) {
            const currentDirection = actionMap[direction];
            actions[currentDirection](1);
          }

          if (lastDirection !== undefined) {
            actions[lastDirection](-1);
            setLastDirection(direction === null ? undefined : actionMap[direction]);
          }
        }}
      />
    </div>
  );
};
