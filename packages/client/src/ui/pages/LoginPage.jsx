//@ts-check
import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmnop.png";
import { useNavigateTo as useNavigate } from "@/hooks";
import SnackbarUtils from "../../SnackbarUtils";
import { auth } from "@smiley-face-game/api";
import { tokenGlobal } from "../../state";

const LoginPage = () => {
  const navigate = useNavigate();
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
          navigate("/lobby");
          SnackbarUtils.success("Logged in!");
        })
      }
    />
  );
};

export default LoginPage;
