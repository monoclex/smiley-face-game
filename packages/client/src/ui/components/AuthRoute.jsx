//@ts-check
import React from "react";
import { Redirect } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth, useToken } from "../hooks";

export const AuthRoute = ({ needAccount = false, component: Component, ...props }) => {
  const [token, setToken] = useToken();
  if (!token) {
    return <Redirect to="/" />;
  }

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) {
    // token expired, kill it
    const notistack = useSnackbar();
    notistack.enqueueSnackbar("Your token has expired!", {
      variant: "error",
    });

    setToken(false);

    return <Redirect to="/" />;
  }

  if (needAccount) {
    const auth = useAuth();
    if (auth.isGuest) {
      const notistack = useSnackbar();

      notistack.enqueueSnackbar("You must create an account to access this!", {
        variant: "error",
      });
      return <Redirect to="/lobby" />;
    }
  }

  return <Component {...props} />;
};
