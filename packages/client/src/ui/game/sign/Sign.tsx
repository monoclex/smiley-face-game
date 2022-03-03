import React, { useRef, useState } from "react";
import { useRecoilState } from "recoil";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import PromiseCompletionSource from "../../../PromiseCompletionSource";
import { signStateAtom, text } from "../../../state/signDialog";
import { MAX_SIGN_LENGTH } from "@smiley-face-game/api/types";

export default function Sign() {
  const [signState, setSign] = useRecoilState(signStateAtom);

  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  const handleClose = () => {
    text.it.reject("dialog closed");
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
    setInput("");
  };

  const onSubmit = () => {
    const message = input;
    text.it.resolve(message);
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
    setInput("");
  };

  const onUpdate = () => {
    console.log("onupdate called");
    if (!inputRef.current) return;
    setInput((inputRef.current.value ?? "").substring(0, MAX_SIGN_LENGTH));
  };

  return (
    <Dialog open={signState.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sign Text</DialogTitle>

      <DialogContent>
        <TextField
          id="message"
          label="Message"
          type="text"
          margin="dense"
          placeholder="Write a message on the sign"
          autoComplete="off"
          rows={4}
          multiline
          fullWidth
          autoFocus
          error={false}
          helperText={`${input.length}/${MAX_SIGN_LENGTH}`}
          inputRef={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // prevent the chat from consuming the enter key event
              e.stopPropagation();
            }
          }}
          onInput={onUpdate}
          value={input}
        />
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="inherit" type="submit" onClick={onSubmit}>
          Write
        </Button>
      </DialogActions>
    </Dialog>
  );
}
