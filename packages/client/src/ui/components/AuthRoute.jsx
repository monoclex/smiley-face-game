//@ts-check
import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { useSnackbar } from "notistack";
import { useToken } from "../hooks";
import { Authentication } from "@smiley-face-game/api";

export const AuthRoute = ({ needAccount = false, element }) => {
  const [token, setToken] = useToken();
  const notistack = useSnackbar();

  if (!token) {
    return <Navigate to="/" />;
  }

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) {
    // token expired, kill it
    notistack.enqueueSnackbar("Your token has expired!", {
      variant: "error",
    });

    setToken(false);

    return <Navigate to="/" />;
  }

  if (needAccount) {
    const auth = new Authentication(token);
    if (auth.isGuest) {
      notistack.enqueueSnackbar("You must create an account to access this!", {
        variant: "error",
      });

      return <Navigate to="/lobby" />;
    }
  }

  return element;
};
