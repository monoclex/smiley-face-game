"use strict";
import React from "react";
import { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Block from "./Block";
import { SelectedSlotId } from '../../../client/Slot';

const BlockBar = (props) => {
  const keys = "`1234567890-=".split("");

  useEffect(() => {
    document.addEventListener('keydown', keyboardEvent => {
      const map = {
        '`': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '0': 10,
        '-': 11,
        '=': 12,
        '~': 0,
        '!': 1,
        '@': 2,
        '#': 3,
        '$': 4,
        '%': 5,
        '^': 6,
        '&': 7,
        '*': 8,
        '(': 9,
        ')': 10,
        '_': 11,
        '+': 12
      };

      const slot = map[keyboardEvent.key];

      if (slot === undefined) return;
      if (props.onBlockSelected === undefined) return;

      props.onBlockSelected(slot);
    });
  }, []);

  return (
    <Grid item container justify="center" alignItems="flex-end">
      {keys.map((key, i) => (
        <Block key={key} slot={key} slotId={i} onClick={() => props.onBlockSelected(i)} selected={props.selected === i} loader={props.loader} />
      ))}
    </Grid>
  );
};

export default BlockBar;