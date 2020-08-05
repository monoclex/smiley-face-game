import * as React from "react";
import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";

const Login = () => {
  const [redirectRegister, setRedirectRegister] = useState(false);

  if (redirectRegister) {
    // see Lobby.tsx
    return (
      <Redirect to="/register" />
    );
  }

  return (
    <>
      <Typography component="h1" variant="h3">
        wow, login!
      </Typography>
      <Button onClick={() => setRedirectRegister(true)}>
        <Typography component="h1" variant="h3">
          go to register
        </Typography>
      </Button>
    </>
  );
};

export default Login;
