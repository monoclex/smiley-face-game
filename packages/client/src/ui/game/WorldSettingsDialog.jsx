import React from "react";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import * as PropTypes from "prop-types";
import state from "../../bridge/state";

// eslint-disable-next-line @typescript-eslint/no-use-before-define
WorldSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function WorldSettingsDialog({ open, onClose }) {
  const composeToClose = (callback) => () => {
    callback();
    onClose();
  };

  const game = state.game;
  const save = composeToClose(() => game.connection.save());
  const load = composeToClose(() => game.connection.load());

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>World Settings</DialogTitle>
      <DialogContent>
        <Button onClick={save}>Save World</Button>
        <Button onClick={load}>Load World</Button>
      </DialogContent>
      {/* <DialogActions></DialogActions> */}
    </Dialog>
  );
}
