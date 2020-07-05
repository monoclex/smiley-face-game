"use strict";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Block from "./Block";

const useStyles = makeStyles({
  blockbar: {
    backgroundColor: '#8A8A8A',
  }
});

const BlockBar: React.FC<{}> = (props) => {
  const styles = useStyles();
  const keys = "`1234567890-=".split("");



  return (
    <Grid item container justify="center" alignItems="flex-end">
      {keys.map(key => (
        <Block slot={key} />
      ))}
    </Grid>
  );
};

export default BlockBar;