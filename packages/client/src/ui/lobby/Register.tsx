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
  const [success, setSuccess] = useState<undefined | { status: true, token: string } | { status: false, error: Error } | { status: null }>(undefined);

  const submitRegister = () => {
    setSuccess({ status: null });

    return fetch(api.register(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        username,
        password,
      })
    })
      .then(result => {
        if (!result.ok) {
          // TODO: figure out how to do this error nicely
          alert(JSON.stringify({
            email,
            username,
            password,
          }));
          return result.text().then(body => {
            throw new Error("result json was NOT ok....... " + JSON.stringify(body));
          });
        }

        return result.json();
      })
      .then(result => {
        setSuccess({ status: true, token: result.token });
      })
      .catch(error => setSuccess({ status: false, error }));
  };

  if (redirectLogin) {
    // see Lobby.tsx
    return (
      <Redirect to="/login" />
    );
  }

  if (success) {
    if (success.status === null) {
      return (
        <h1>logging you in..........</h1>
      );
    }
    else if (success.status === true) {
      return (
        <h1>it,.,., you registered! wowzor. ur token is {success.token}</h1>
      );
    }
    else if (success.status === false) {
      return (
        <h1> oh not it . errorede {success.error.toString()}</h1>
      );
    }
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
