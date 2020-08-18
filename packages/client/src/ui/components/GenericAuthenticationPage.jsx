//@ts-check
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  bigSmileyFace: {
    width: "512px",
    height: "512px",
    imageRendering: "crisp-edges"
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
    <>
      <img className={styles.bigSmileyFace} src={smileyUrl} />
      {inputs.map((input, index) => (
        <React.Fragment key={index}>
          <Typography>
            {typeof input.text === "function" ? input.text(values[index]) : input.text}
          </Typography>
          <TextField onChange={({ target: { value } }) => setValues[index](value)} />
        </React.Fragment>
      ))}
      <Button onClick={() => submit(values)}>
        Go!
      </Button>
    </>
  );
};
