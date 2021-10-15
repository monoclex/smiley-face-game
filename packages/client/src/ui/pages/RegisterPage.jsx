//@ts-check
import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import { useHistory } from "react-router";
import SnackbarUtils from "../../SnackbarUtils";
import { register } from "@smiley-face-game/api";

const RegisterPage = () => {
  const history = useHistory();
  return (
    <GenericAuthenticationPage
      smileyUrl={urlPlayer}
      inputs={[
        { name: "username", text: "Enter your username" },
        { name: "email", text: "Enter your email" },
        { name: "password", text: "Enter your password", type: "password" },
      ]}
      submit={({ username, email, password }) =>
        register({ username, email, password }).then(({ token }) => {
          localStorage.setItem("token", token);
          history.push("/lobby");
          SnackbarUtils.success("Registered account!");
        })
      }
    />
  );
};

export default RegisterPage;
