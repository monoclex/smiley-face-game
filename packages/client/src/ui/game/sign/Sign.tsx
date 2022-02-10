import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useRef } from "react";
import { useRecoilState } from "recoil";
import PromiseCompletionSource from "../../../PromiseCompletionSource";
import { signState, text } from "../../../state/signDialog";

export default function Sign() {
  console.log("sign rendering");
  const [sign, setSign] = useRecoilState(signState);
  const textField = useRef<any>();

  const handleClose = () => {
    text.it.reject("dialog closed");
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
  };

  const handleSubmit = () => {
    text.it.resolve(textField.current.value);
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
  };

  console.log("is it open", sign);
  return (
    <Dialog open={sign.open}>
      <DialogTitle>Sign Text</DialogTitle>
      <DialogContent>
        <DialogContentText>Please write a message on the sign</DialogContentText>
        <TextField
          inputRef={textField}
          autoFocus
          margin="dense"
          id="text"
          label="Message"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Write</Button>
      </DialogActions>
    </Dialog>
  );
}
