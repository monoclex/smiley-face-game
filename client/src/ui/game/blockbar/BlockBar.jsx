"use strict";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Block from "./Block";
import { SelectedSlotId } from '../../../client/Slot';

const BlockBar = (props) => {
  const keys = "`1234567890-=".split("");

  return (
    <Grid item container justify="center" alignItems="flex-end">
      {keys.map((key, i) => (
        <Block key={key} slot={key} slotId={i} onClick={() => props.onBlockSelected(i)} selected={props.selected === i} loader={props.loader} />
      ))}
    </Grid>
  );
};

export default BlockBar;