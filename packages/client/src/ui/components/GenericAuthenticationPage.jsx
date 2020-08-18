//@ts-check
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles({
  bigSmileyFace: {
    // make it large
    width: "512px",
    height: "512px",
    // when upscaling, don't make it blurry
    imageRendering: "crisp-edges",
    // center it
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  }
})

export default ({ smileyUrl, inputs, submit }) => {
  const styles = useStyles();

  let values = [], setValues = [];

  for (const _ of inputs) {
    const [value, setValue] = useState("");
    values.push(value);
    setValues.push(setValue);
  }

  return (
    <Container component="main" maxWidth="sm">
      <img className={styles.bigSmileyFace} src={smileyUrl} />
      {inputs.map((input, index) => (
        <TextField
          fullWidth
          key={index}
          label={typeof input.text === "function" ? input.text(values[index]) : input.text}
          onKeyDown={({ keyCode }) => keyCode === 13 ? submit(values) : undefined}
          onChange={({ target: { value } }) => setValues[index](value)}
        />
      ))}
      <Button fullWidth onClick={() => submit(values)}>
        Go!
      </Button>
    </Container>
  );
};
