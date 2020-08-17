//@ts-check
import React, { useState, useEffect } from "react";
import * as qs from "query-string";
import { makeStyles } from "@material-ui/core/styles";
import urlPlayer from "@/assets/mmmyep.png";
import history from "@/ui/history";
import { api } from "@/isProduction";

const useStyles = makeStyles({

});

export default ({ location: { search } }) => {
  const { token } = qs.parse(search);

  const styles = useStyles();

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    api.getLobby(token)
      .then(lobby => {
        console.log(lobby);
      });
  }, []);

  return (
    <>
    </>
  );
};
