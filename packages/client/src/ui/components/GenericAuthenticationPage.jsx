//@ts-check
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import clsx from "clsx";
import { styled } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { zUsername, zPassword, zEmail } from "@smiley-face-game/api/types";

const BigSmileyFace = styled("img")({
  // make it large
  width: "512px",
  height: "512px",
  // center it
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",

  imageRendering: "pixelated",
  // imageRendering:
  //   // old firefox
  //   "-moz-crisp-edges" +
  //   // new firefox
  //   " crisp-edges" +
  //   // chrome
  //   " pixelated",
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

const GenericAuthenticationPage = ({ smileyUrl, inputs, submit }) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm();
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
      <BigSmileyFace src={smileyUrl} />
      {isWorking && (
        <Grid container direction="row" justifyContent="center" alignItems="center">
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
            {...register(input.name, { required: true, validate: validators[input.name] })}
          />
        ))}
        <Button disabled={isWorking} fullWidth type="submit">
          Go!
        </Button>
      </form>
    </Container>
  );
};

export default GenericAuthenticationPage;
