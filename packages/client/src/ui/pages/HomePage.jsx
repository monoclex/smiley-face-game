//@ts-check

import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { Grid, Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
}));

export default () => {
  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="h3">Smiley Face Game</Typography>
        </Grid>

        <Grid container justify="center" alignItems="center" item spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/register">
              Register
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" component={Link} to="/login">
              Login
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" component={Link} to="/guest">
            Play as Guest
          </Button>
        </Grid>
        <Grid item>
          <Button color="secondary" component={Link} to="/terms">
            Read Terms and Conditions
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};
