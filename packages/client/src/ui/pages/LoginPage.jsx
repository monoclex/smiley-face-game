import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import history from "../../ui/history";
import { api } from "../../isProduction";
import SnackbarUtils from "../../SnackbarUtils";

export default () => (
  <GenericAuthenticationPage
    smileyUrl={urlPlayer}
    inputs={[
      { name: "email", text: "Enter your email" },
      { name: "password", text: "Enter your password", type: "password" },
    ]}
    submit={({ email, password }) => {
      api
        .postLogin(email.toLowerCase(), password)
        .then((result) => {
          if (!result.ok) {
            console.warn("Failed to authenticate at login endpoint", result);
            SnackbarUtils.error("Failed to log in. Try again?");
            return;
          }

          return result.json();
        })
        .then((json) => {
          if (json.error) {
            SnackbarUtils.error("Failed to log in. " + json.error);
            return;
          }

          localStorage.setItem("token", json.token);
          history.push("/lobby");
        });
    }}
  />
);
