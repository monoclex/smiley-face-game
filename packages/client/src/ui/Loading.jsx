//@ts-check
import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";

const FullScreenGrid = styled(Grid)({
  // we want it to be closer to the top of the page, rather than perfectly centered - so 80 instead of 100
  // (perfectly centered looks weird)
  minHeight: "80vh",
});

const Loading = ({ message = "Loading..." }) => {
  return (
    // we don't want 100% because then Loading looks too far down, so we'll put it up a bit
    <FullScreenGrid container alignItems="center" justifyContent="center">
      <Grid item>
        <Typography variant="h1" component="h1">
          {message}
        </Typography>
      </Grid>
    </FullScreenGrid>
  );
};

export default Loading;
