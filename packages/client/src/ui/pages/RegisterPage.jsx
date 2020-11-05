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
      { name: "username", text: "Enter your username" },
      { name: "email", text: "Enter your email" },
      { name: "password", text: "Enter your password", type: "password" },
    ]}
    submit={({ username, email, password }) => {
      // TODO: lol
      api
        .postRegister(username, email.toLowerCase(), password)
        .then((result) => {
          if (!result.ok) {
            console.warn("Failed to authenticate at register endpoint", result);
            SnackbarUtils.error("Failed to register. Try again?");
            return;
          }

          return result.json();
        })
        .then((json) => {
          if (json.error) {
            SnackbarUtils.error("Failed to register. " + json.error);
            return;
          }

          localStorage.setItem("token", json.token);
          history.push("/lobby");
        });
    }}
  />
);
