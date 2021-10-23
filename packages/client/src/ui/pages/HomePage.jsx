//@ts-check
import { useEffect } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Grid, Typography, Container, styled } from "@mui/material";

const PaddedContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const HomePage = () => {
  const history = useHistory();

  // if they have a token, they should go straight to the lobby
  if (localStorage.getItem("token") !== null) {
    console.log("HomePage getItem", localStorage.getItem("token"));
    // can't perform transition within a render
    useEffect(() => history.push("/lobby"), []);
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
