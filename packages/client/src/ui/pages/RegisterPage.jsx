//@ts-check
import React from "react";
import GenericAuthenticationPage from "@/ui/components/GenericAuthenticationPage";
import urlPlayer from "@/assets/mmmnop.png";
import history from "@/ui/history";
import { api } from "@/isProduction";

export default () => (
  <GenericAuthenticationPage
    smileyUrl={urlPlayer}
    inputs={[
      { text: "Enter your username" },
      { text: "Enter your email" },
      { text: "Enter your password" },
    ]}
    submit={([ username, email, password ]) => {
      api.postRegister(username, email, password)
        .then(result => {
          if (!result.ok) {
            console.warn('Failed to authenticate at register endpoint', result);
            return;
          }
        
          return result.json()
        })
        .then(json => {
          localStorage.setItem("token", json.token);
          history.push("/lobby");
        });
    }}
  />
);