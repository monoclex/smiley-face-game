import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmyep.png";
import { auth } from "@smiley-face-game/api";
import { useHistory } from "react-router";

const GuestPage = () => {
  const history = useHistory();
  return (
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
};

export default GuestPage;
