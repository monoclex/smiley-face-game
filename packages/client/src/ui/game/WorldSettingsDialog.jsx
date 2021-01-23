import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import PropTypes from "prop-types";
import gameSelector from "../../recoil/selectors/game";
import { useRecoilValue } from "recoil";

// eslint-disable-next-line @typescript-eslint/no-use-before-define
WorldSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function WorldSettingsDialog({ open, onClose }) {
  const game = useRecoilValue(gameSelector);

  const composeToClose = (callback) => () => {
    callback();
    onClose();
  };

  const save = composeToClose(() => game.save());
  const load = composeToClose(() => game.load());

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
