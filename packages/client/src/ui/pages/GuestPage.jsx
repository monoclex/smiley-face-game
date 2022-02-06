import React from "react";
import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmyep.png";
import { auth } from "@smiley-face-game/api";
import { useNavigate } from "react-router";
import { tokenGlobal } from "../../state";

const GuestPage = () => {
  const navigate = useNavigate();
  return (
    <GenericAuthenticationPage
      smileyUrl={urlPlayer}
      inputs={[{ name: "username", text: (value) => (!value ? "Enter your preferred username" : `Hello, ${value}!`) }]}
      submit={({ username }) =>
        auth({ username }).then(({ token }) => {
          tokenGlobal.set(token);
          navigate("/lobby");
        })
      }
    />
  );
};

export default GuestPage;
