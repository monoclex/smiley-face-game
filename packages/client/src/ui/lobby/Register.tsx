import * as React from "react";
import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Redirect } from 'react-router-dom';
import Button from "@material-ui/core/Button";

const Register = () => {
  const [redirectLogin, setRedirectLogin] = useState(false);

  if (redirectLogin) {
    // see Lobby.tsx
    return (
      <Redirect to="/login" />
    );
  }

  return (
    <>
      <Typography component="h1" variant="h3">
        wow register!
      </Typography>
      <Button onClick={() => setRedirectLogin(true)}>
        <Typography component="h1" variant="h3">
          go to login
        </Typography>
      </Button>
    </>
  );
};

export default Register;
