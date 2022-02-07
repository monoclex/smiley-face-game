//@ts-check
import React from "react";
import { Navigate } from "react-router";
import { useSnackbar } from "notistack";
import { useToken } from "../hooks";
import { Authentication } from "@smiley-face-game/api";
import { useEffectOnce } from "react-use";

// TODO: clean this up
// this is kinda hard and painful cuz we conditionally call hooks

export const AuthRoute = ({ element }) => {
  const [token, setToken] = useToken();
  const notistack = useSnackbar();

  if (!token) {
    return <Navigate to="/" />;
  }

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) {
    // token expired, kill it
    useEffectOnce(() => {
      notistack.enqueueSnackbar("Your token has expired!", {
        variant: "error",
      });
    });

    setToken(false);

    return <Navigate to="/" />;
  }

  return element;
};

export const AccountRoute = ({ element }) => {
  const [token, setToken] = useToken();
  const notistack = useSnackbar();

  if (!token) {
    return <Navigate to="/" />;
  }

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) {
    // token expired, kill it
    useEffectOnce(() => {
      notistack.enqueueSnackbar("Your token has expired!", {
        variant: "error",
      });
    });

    setToken(false);

    return <Navigate to="/" />;
  }

  const auth = new Authentication(token);
  if (auth.isGuest) {
    useEffectOnce(() => {
      notistack.enqueueSnackbar("You must create an account to access this!", {
        variant: "error",
      });
    });

    return <Navigate to="/lobby" />;
  }

  return element;
};
