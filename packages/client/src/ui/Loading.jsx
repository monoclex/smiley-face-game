//@ts-check
import React from "react";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles({
  fullScreen: {
    // we want it to be closer to the top of the page, rather than perfectly centered - so 80 instead of 100
    // (perfectly centered looks weird)
    minHeight: "80vh",
  },
});

const Loading = ({ message = "Loading..." }) => {
  const styles = useStyles();

  return (
    // we don't want 100% because then Loading looks too far down, so we'll put it up a bit
    <Grid className={styles.fullScreen} container alignItems="center" justifyContent="center">
      <Grid item>
        <Typography variant="h1" component="h1">
          {message}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Loading;
