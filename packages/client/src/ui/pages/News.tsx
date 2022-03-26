import { Typography } from "@mui/material";
import React from "react";

export default function News() {
  return (
    <>
      <Typography variant="h1">Work-In-Progress News!</Typography>
      <Typography variant="caption">the current design is a placeholder</Typography>

      <Typography variant="body1">
        This week, 2022-03-26, we have some new design! It's not perfect yet, but it looks really
        good and it makes the game feel more polished. At some point I'll try to re-design more of
        the game.
      </Typography>

      <Typography variant="body1">
        The plan for SFG is to polish it up to get it ready to release on different platforms as
        soon as possible. My primary goal is to get more players playing the game.
      </Typography>

      <Typography variant="body1">
        In other less fortunate news, I will be busy with IRL responsibilities starting next week,
        so don't expect as much progress as there has been so far.
      </Typography>

      <Typography variant="body1">
        The next update will be a new blockbar, but I can't promise that this will come soon. After
        that, I plan on doing spawnpoints and trophies.
      </Typography>
    </>
  );
}
