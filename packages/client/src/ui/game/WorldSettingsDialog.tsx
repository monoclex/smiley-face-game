//@ts-check
import React from "react";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import * as PropTypes from "prop-types";
import state from "../../bridge/state";

const panic = (message: string) => {
  throw new Error(message);
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const WorldSettingsDialog = ({ open, onClose }: Props) => {
  const composeToClose = (callback: () => void) => () => {
    callback();
    onClose();
  };

  const game = state.game ?? panic("assertion failed");
  const save = composeToClose(() => game.connection.save());
  const load = composeToClose(() => game.connection.load());

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>World Settings</DialogTitle>
      <DialogContent>
        <Button onClick={save}>Save World</Button>
        <Button onClick={load}>Load World</Button>
      </DialogContent>
    </Dialog>
  );
};

WorldSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorldSettingsDialog;
