//@ts-check
import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmyep.png";
import history from "../../ui/history";
import { auth } from "@smiley-face-game/api";

export default () => (
  <GenericAuthenticationPage
    smileyUrl={urlPlayer}
    inputs={[{ name: "username", text: (value) => (!value ? "Enter your preferred username" : `Hello, ${value}!`) }]}
    submit={({ username }) =>
      auth({ username }).then(({ token }) => {
        localStorage.setItem("token", token);
        history.push("/lobby");
      })
    }
  />
);
