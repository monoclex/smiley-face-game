//@ts-check
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import urlPlayer from "@/assets/mmmyep.png";
import history from "@/ui/history";

const useStyles = makeStyles({
  bigSmileyFace: {
    width: "512px",
    height: "512px",
    imageRendering: "crisp-edges"
  }
})

export default () => {
  const styles = useStyles();

  const [preferredName, setPreferredName] = useState("");

  return (
    <>
      <img className={styles.bigSmileyFace} src={urlPlayer} />
      <Typography>
        { !!preferredName && "Hello, " + preferredName + "!" }
        { !!preferredName || "Enter your preferred name!" }
      </Typography>
      <TextField onChange={({ target: { value } }) => setPreferredName(value)} />
      <Button onClick={() => { history.push("auth?name=" + encodeURIComponent(preferredName)); }}>
        Go!
      </Button>
    </>
  );
};
