//@ts-check
import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import { useHistory } from "react-router";
import SnackbarUtils from "../../SnackbarUtils";
import { auth } from "@smiley-face-game/api";
import { tokenGlobal } from "../../state";

const LoginPage = () => {
  const history = useHistory();
  return (
    <GenericAuthenticationPage
      smileyUrl={urlPlayer}
      inputs={[
        { name: "email", text: "Enter your email" },
        { name: "password", text: "Enter your password", type: "password" },
      ]}
      submit={({ email, password }) =>
        auth({ email: email.toLowerCase(), password }).then(({ token }) => {
          tokenGlobal.set(token);
          history.push("/lobby");
          SnackbarUtils.success("Logged in!");
        })
      }
    />
  );
};

export default LoginPage;
