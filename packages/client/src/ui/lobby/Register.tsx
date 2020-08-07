import * as React from "react";
import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Redirect } from 'react-router-dom';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Login from './Login';
import { api } from '../../isProduction';

const Register = () => {
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitRegister = () =>
    // TODO: make it work
    fetch(api.register(), {
      method: "POST"
    });

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
      <br />
      <Button onClick={() => setRedirectLogin(true)}>
        <Typography component="h1" variant="h3">
          go to login
        </Typography>
      </Button>

      {/* TODO: use react hook forms */}
      <TextField id="username" type="text" label="name" onChange={({ target: { value } }) => setUsername(value)} />
      <br />
      <TextField id="email" type="text" label="email" onChange={({ target: { value } }) => setEmail(value)} />
      <br />
      <TextField id="password" type="password" label="password" onChange={({ target: { value } }) => setPassword(value)} />
      <br />
      <Button onClick={() => submitRegister()}>
        sign up
      </Button>
    </>
  );
};

export default Register;
