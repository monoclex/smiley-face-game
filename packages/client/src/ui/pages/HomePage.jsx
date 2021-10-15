//@ts-check
import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Grid, Typography, Container, styled } from "@mui/material";
import history from "../../ui/history";

const PaddedContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const HomePage = () => {
  // if they have a token, they should go straight to the lobby
  if (localStorage.getItem("token") !== null) {
    history.push("/lobby");
    return null;
  }

  return (
    <PaddedContainer maxWidth={false}>
      <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
        <Grid item>
          <Typography variant="h3">Smiley Face Game</Typography>
        </Grid>

        <Grid container justifyContent="center" alignItems="center" item spacing={2}>
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
    </PaddedContainer>
  );
};

export default HomePage;
