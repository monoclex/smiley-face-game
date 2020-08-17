//@ts-check
import React, { useState, useEffect } from "react";
import * as qs from "query-string";
import Typography from "@material-ui/core/Typography";
import Loading from "@/ui/Loading";
import history from "@/ui/history";
import { api } from "@/isProduction";

export default ({ location: { search } }) => {
  const { email, username, password, name } = qs.parse(search);

  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState(null);

  useEffect(() => {
    postRequest()
      .then(result => {
        if (!result.ok) {
          console.warn('Failed to authenticate at guest endpoint', result);
          setStatus("Failed.");
          return;
        }
      
        return result.json()
      })
      .then(json => {
        history.push("/lobby?token=" + encodeURIComponent(json.token));
      })
      .catch(setError);

    function postRequest() {
      if (typeof name === "string") {
        // guest wanting to play, this is our name
        return api.postAuthGuest(name);
      }
      else if (typeof email === "string" && typeof password === "string") {
        if (typeof username === "string") {
          // we would only include the username when registering
          return api.postRegister(username, email, password);
        }
        else {
          // user wanting to authenticate with a username and password
          return api.postLogin(email, password);
        }
      }
      else {
        throw new Error("unexpected query params");
      }
    }
  }, []);

  if (error) {
    return (
      <Typography>
        Error: {error.toString()}
      </Typography>
    );
  }

  return (
    <Loading message={status} />
  );
};