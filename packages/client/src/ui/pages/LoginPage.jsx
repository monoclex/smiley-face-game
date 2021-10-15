import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import history from "../../ui/history";
import SnackbarUtils from "../../SnackbarUtils";
import { auth } from "@smiley-face-game/api";

const LoginPage = () => (
  <GenericAuthenticationPage
    smileyUrl={urlPlayer}
    inputs={[
      { name: "email", text: "Enter your email" },
      { name: "password", text: "Enter your password", type: "password" },
    ]}
    submit={({ email, password }) =>
      auth({ email: email.toLowerCase(), password }).then(({ token }) => {
        localStorage.setItem("token", token);
        history.push("/lobby");
        SnackbarUtils.success("Logged in!");
      })
    }
  />
);

export default LoginPage;
