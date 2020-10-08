//@ts-check
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import { validateUsername } from "@smiley-face-game/schemas/Username";
import { validateEmail } from "@smiley-face-game/schemas/Email";
import { validatePassword } from "@smiley-face-game/schemas/Password";

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
  const result = validator(input)[0];
  if (result === null) return undefined;
  return result.toString();
};

const validators = {
  // hacky way to do this and not pass in props, but idk i don't feel like properly architecturing my code
  username: wrapValidator(validateUsername),
  email: (input) => wrapValidator(validateEmail)(input.toLowerCase()),
  password: wrapValidator(validatePassword),
};

export default ({ smileyUrl, inputs, submit }) => {
  const styles = useStyles();
  const { handleSubmit, register, errors, watch } = useForm();

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
      <form onSubmit={handleSubmit(submit)}>
        {inputs.map((input, index) => (
          <TextField
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
        <Button fullWidth type="submit">
          Go!
        </Button>
      </form>
    </Container>
  );
};
