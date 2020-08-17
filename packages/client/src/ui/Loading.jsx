//@ts-check
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  fullScreen: {
    // we want it to be closer to the top of the page, rather than perfectly centered - so 80 instead of 100
    // (perfectly centered looks weird)
    minHeight: "80vh"
  }
})

export default ({ message }) => {
  const styles = useStyles();

  return (
    // we don't want 100% because then Loading looks too far down, so we'll put it up a bit
    <Grid className={styles.fullScreen} container alignItems="center" justify="center">
      <Grid item>
        <Typography variant="h1" component="h1">
          { message ?? "Loading..." }
        </Typography>
      </Grid>
    </Grid>
  );
};
