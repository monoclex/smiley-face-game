import * as React from "react";
import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { api } from "../../isProduction";

const Login = () => {
  const [redirectRegister, setRedirectRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = () =>
    // TODO: make it work
    fetch(api.login(), {
      method: "POST"
    });

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
      <br />
      <Button onClick={() => setRedirectRegister(true)}>
        <Typography component="h1" variant="h3">
          go to register
        </Typography>
      </Button>
      <br />


      {/* TODO: use react hook forms */}
      <TextField id="username" type="text" label="name" onChange={({ target: { value } }) => setUsername(value)} />
      <br />
      <TextField id="password" type="password" label="password" onChange={({ target: { value } }) => setPassword(value)} />
      <br />
      <Button onClick={() => submitLogin()}>
        log in
      </Button>
    </>
  );
};

export default Login;
