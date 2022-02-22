import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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

type Inputs = {
  message: string;
};

export default function Sign() {
  const [signState, setSign] = useRecoilState(signStateAtom);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const handleClose = () => {
    text.it.reject("dialog closed");
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
    reset();
  };

  const onSubmit: SubmitHandler<Inputs> = ({ message }) => {
    text.it.resolve(message);
    setSign({ open: false });
    text.it = new PromiseCompletionSource();
    reset();
  };

  return (
    <Dialog open={signState.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            error={Boolean(errors && errors.message)}
            helperText={errors && errors.message && "A message must be no longer than 200 chars..."}
            inputProps={{
              min: 0,
              max: MAX_SIGN_LENGTH,
            }}
            {...register("message", { required: true, maxLength: MAX_SIGN_LENGTH })}
          />
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="inherit" type="submit">
            Write
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
