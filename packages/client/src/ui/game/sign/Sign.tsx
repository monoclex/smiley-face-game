import React, { useRef, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import PromiseCompletionSource from "@/PromiseCompletionSource";
import { MAX_SIGN_LENGTH } from "@smiley-face-game/api/types";
import { signOpen } from "@/state";
import { useGameAnswerer, useUncachedState } from "@/hooks";

type SignReply = PromiseCompletionSource<string | undefined>;
const promiseCompletionSourceFactory: () => SignReply = () =>
  new PromiseCompletionSource<string | undefined>();

export default function Sign() {
  const [signTextCompletion, setSignTextCompletion] = useState(promiseCompletionSourceFactory);

  useGameAnswerer("signText", () => {
    const promiseCompletionSource = promiseCompletionSourceFactory();
    setSignTextCompletion(promiseCompletionSource);
    return promiseCompletionSource.handle;
  });

  const [input, setInput] = useUncachedState("");

  const resolveSignTextCompletion = (response: string | undefined) => {
    signTextCompletion.resolve(response);
    signOpen.value = false;
    setInput("");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => resolveSignTextCompletion(undefined);
  const onSubmit = () => resolveSignTextCompletion(input);

  const onUpdate = () => {
    if (!inputRef.current) return;
    setInput((inputRef.current.value ?? "").substring(0, MAX_SIGN_LENGTH));
  };

  return (
    // NOTE: `signOpen` isn't controlled by any fancy react things. so changing it
    // directly won't induce the dialogue to open/close, but the calls to setState
    // will trigger a re-render (of which the signOpen value would change)
    <Dialog open={signOpen.value} onClose={handleClose} maxWidth="sm" fullWidth>
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
