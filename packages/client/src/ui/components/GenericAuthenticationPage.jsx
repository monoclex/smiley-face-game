import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import { zUsername, zPassword, zEmail } from "@smiley-face-game/common/types";

const useStyles = makeStyles({
  bigSmileyFace: {
    // make it large
    width: "512px",
    height: "512px",
    // center it
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  upscalingOldFirefox: {
    imageRendering: "-moz-crisp-edges",
  },
  upscalingNewFirefox: {
    imageRendering: "crisp-edges",
  },
  upscalingChrome: {
    imageRendering: "pixelated",
  },
});

const wrapValidator = (validator) => (input) => {
  const result = validator.safeParse(input);
  if (!result.success) {
    return result.errors.toString();
  }
  return undefined;
};

const validators = {
  // hacky way to do this and not pass in props, but idk i don't feel like properly architecturing my code
  username: wrapValidator(zUsername),
  email: (input) => wrapValidator(zEmail)(input.toLowerCase()),
  password: wrapValidator(zPassword),
};

export default ({ smileyUrl, inputs, submit }) => {
  const styles = useStyles();
  const { handleSubmit, register, errors, watch } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [isWorking, setWorking] = useState(false);

  const onSubmit = (payload) => {
    setWorking(true);
    submit(payload)
      .catch((error) => {
        enqueueSnackbar(error.toString(), {
          variant: "error",
        });
      })
      .finally(() => {
        setWorking(false);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <img
        className={clsx(
          styles.bigSmileyFace,
          styles.upscalingOldFirefox,
          styles.upscalingNewFirefox,
          styles.upscalingChrome
        )}
        src={smileyUrl}
      />
      {isWorking && (
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {inputs.map((input, index) => (
          <TextField
            disabled={isWorking}
            key={index}
            type={input?.type}
            fullWidth
            id={input.name}
            name={input.name}
            label={typeof input.text === "function" ? input.text(watch(input.name)) : input.text}
            error={!!(errors && errors[input.name])}
            helperText={errors && errors[input.name]?.message}
            inputRef={register({ required: true, validate: validators[input.name] })}
          />
        ))}
        <Button disabled={isWorking} fullWidth type="submit">
          Go!
        </Button>
      </form>
    </Container>
  );
};
