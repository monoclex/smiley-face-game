//@ts-check
import React, { useState, useEffect } from "react";
import * as qs from "query-string";
import Typography from "@material-ui/core/Typography";
import Loading from "@/ui/Loading";
import history from "@/ui/history";
import { api } from "@/isProduction";

export default ({ location: { search } }) => {
  const { register, username, password, name } = qs.parse(search);

  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof name === "string") {
      // guest wanting to play, this is our name
      fetch(api.auth())
        .then(() => setStatus("Done Guest!"))
        .then(() => history.push("/play"))
        .catch(setError);
    }
    else if (typeof username === "string" && typeof password === "string") {
      const doRegister = register === "yes";
      setStatus(doRegister);

      // user wanting to authenticate with a username and password
      fetch(api.auth())
        .then(() => setStatus("Done Auth!"))
        .then(() => history.push("/play"))
        .catch(setError);
    }
    else {
      setError(new Error("Did not receive a correct query string."));
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