//@ts-check
import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { useSnackbar } from "notistack";
import { useToken, computeAuthStatus } from "../hooks";

// TODO: clean this up
// this is kinda hard and painful cuz we conditionally call hooks

// do NOT pass `needAccount` as true to `AuthRoute`
// for some reason, react router v6 is weird
// it makes react think that when you switch to a route with needaccount=true,
// that you're trying to rerender the same unauthenticated authroute and doesn't
// run the use effect hook. very weird stuff
export const AuthRoute = ({ needAccount = false, element }) => {
  const [token, setToken] = useToken();
  const status = computeAuthStatus(token);

  const notistack = useSnackbar();

  useEffect(() => {
    let message;

    if (status === "expired") {
      message = "Your token has expired!";
      setToken(false);
    }

    if (needAccount && status === "guest") {
      message = "You must create an account to access this!";
    }

    if (message) {
      notistack.enqueueSnackbar(message, { variant: "error" });
    }
  }, [status]);

  if (status === "not logged in" || status === "expired") return <Navigate to="/" />;
  if (status === "guest" && needAccount) return <Navigate to="/lobby" />;
  return element;
};

export const AccountRoute = ({ element }) => <AuthRoute needAccount element={element} />;
