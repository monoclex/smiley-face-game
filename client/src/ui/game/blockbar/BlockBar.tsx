"use strict";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Block from "./Block";
import { SelectedSlotId, SlotId } from '../../../client/Slot';

const useStyles = makeStyles({
  blockbar: {
    backgroundColor: '#8A8A8A',
  }
});

interface BlockBarProps {
  onBlockSelected: (slot: SelectedSlotId) => void;
  selected: SlotId;
}

const BlockBar: React.FC<BlockBarProps> = (props) => {
  const styles = useStyles();
  const keys = "`1234567890-=".split("");

  return (
    <Grid item container justify="center" alignItems="flex-end">
      {keys.map((key, i) => (
        <Block key={key} slot={key} onClick={() => props.onBlockSelected(i as SelectedSlotId)} selected={props.selected === i} />
      ))}
    </Grid>
  );
};

export default BlockBar;