//@ts-check
import React, { useState } from "react";

import { Fade, Grid } from "@mui/material";
import useInterval from "react-use/esm/useInterval";

import { slice } from "../../helpers/iterables";

export default function Carousel({ visibleItems, delay = 4000, timeout = 750, children }) {
  const [index, setSelectedItem] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextItem = () => {
    if (index + visibleItems >= children.length - 1) {
      setSelectedItem(0);
      return;
    }

    setSelectedItem(index + visibleItems);
  };

  useInterval(() => nextItem(), isHovering ? null : delay);

  if (!Array.isArray(children)) {
    return children;
  }

  return (
    <Grid container spacing={2}>
      {slice(children, index, index + visibleItems).map((x, i) => {
        return (
          // The desired effect of the Fade is to have all the visible items fade in on a new cycle.
          // We can't use a random key because we're using setIsHovering, which changes the state, which makes it rerender, which makes it fade in again.
          // A unique key doesn't work either because it won't fade in on a new cycle.
          // Solution: trick react into thinking we give it 3 (visibleItems) new items every time (see: key)

          <Grid item key={index * visibleItems + i}>
            <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              <Fade in={true} timeout={timeout}>
                <div>{x}</div>
              </Fade>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
}
