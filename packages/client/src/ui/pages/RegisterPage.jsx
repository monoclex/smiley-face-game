//@ts-check
import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import { useNavigate } from "react-router";
import SnackbarUtils from "../../SnackbarUtils";
import { register } from "@smiley-face-game/api";
import { tokenGlobal } from "../../state";

const RegisterPage = () => {
  const navigate = useNavigate();
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
          tokenGlobal.set(token);
          navigate("/lobby");
          SnackbarUtils.success("Registered account!");
        })
      }
    />
  );
};

export default RegisterPage;
