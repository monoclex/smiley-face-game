//@ts-check
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Card, Paper, styled, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { zUsername, zPassword, zEmail } from "@smiley-face-game/api/types";
import { useClickAway } from "react-use";
import { Navigate, useNavigate } from "react-router";
import { ChoiceText } from "@/brand/TitleScreen";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rollyBoi } from "@/brand/RollyBoi";

// TODO(clean): have this the same as `@/brand/titleScreen.scss`'s text shadow mixin
const textShadow = "0px 0px 0.25em black, 0px 0px 0.25em black, 0px 0px 0.5em black";

const AwesomeGrid = styled(Grid)({
  height: "100vh",
});

const AwesomeTypography = styled(Typography)({ textShadow, color: "white", marginLeft: "0.25em" });

const BigSmileyFace = styled("img")({
  // make it large
  width: "64px",
  height: "64px",
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

const wrapValidatorErr = (validator, error) => (input) => {
  const result = validator.safeParse(input);
  if (!result.success) {
    return error;
  }
  return undefined;
};

const validators = {
  // hacky way to do this and not pass in props, but idk i don't feel like properly architecturing my code
  username: wrapValidator(zUsername),
  email: (input) =>
    wrapValidatorErr(zEmail, "This doesn't look like an email to me!")(input.toLowerCase()),
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

  const navigate = useNavigate();

  const ref = useRef(null);
  useClickAway(ref, () => navigate("/"));

  return (
    <AwesomeGrid container flexDirection="column" justifyContent="center">
      <Grid item>
        <Container ref={ref} component="main" maxWidth="sm">
          <BigSmileyFace className={rollyBoi} src={smileyUrl} />
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
                variant="standard"
                disabled={isWorking}
                key={index}
                type={input?.type}
                fullWidth
                id={input.name}
                name={input.name}
                label={
                  <AwesomeTypography variant="body1">
                    {typeof input.text === "function" ? input.text(watch(input.name)) : input.text}
                  </AwesomeTypography>
                }
                error={!!(errors && errors[input.name])}
                helperText={errors && errors[input.name]?.message}
                {...register(input.name, { required: true, validate: validators[input.name] })}
              />
            ))}
            <ChoiceText>
              <Button type="submit">
                <Typography variant="h3">go!</Typography>
              </Button>
            </ChoiceText>
          </form>
        </Container>
      </Grid>
    </AwesomeGrid>
  );
};

export default GenericAuthenticationPage;
