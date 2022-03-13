//@ts-check
import React, { useRef } from "react";
import { Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
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
  const input = useRef(null);
  const composeToClose = (callback: () => void) => () => {
    callback();
    onClose();
  };

  const connection = state.connection ?? panic("assertion failed");
  const save = composeToClose(() => connection.save());
  const load = composeToClose(() => connection.load());
  const changeName = composeToClose(() => {
    connection.changeWorldTitle(input.current!.value);
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>World Settings</DialogTitle>
      <DialogContent>
        <Button onClick={save}>Save World</Button>
        <Button onClick={load}>Load World</Button>
        <br />
        <TextField inputRef={input} />
        <Button onClick={changeName}>Change Name</Button>
      </DialogContent>
    </Dialog>
  );
};

WorldSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorldSettingsDialog;
