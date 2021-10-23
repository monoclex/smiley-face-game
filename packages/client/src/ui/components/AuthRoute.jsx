//@ts-check
import { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks";

export const AuthRoute = ({ needAccount = false, component: Component, ...props }) => {
  const token = localStorage.getItem("token");
  if (token === null) {
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

    // don't actually remove the item in local storage here, otherwise we will
    // have different renders - do the rendering in an effect
    useEffect(() => {
      localStorage.removeItem("token");
    }, []);

    return <Redirect to="/" />;
    // return <Redirect to="/login" />;
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
