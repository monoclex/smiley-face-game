//@ts-check
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import urlPlayer from "@/assets/mmmnop.png";
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <img className={styles.bigSmileyFace} src={urlPlayer} />
      <Typography>
        Enter your Username
      </Typography>
      <TextField onChange={({ target: { value } }) => setUsername(value)} />
      <Typography>
        Enter your Password
      </Typography>
      <TextField onChange={({ target: { value } }) => setPassword(value)} />
      <Button onClick={() => { history.push("auth?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password)); }}>
        Go!
      </Button>
    </>
  );
};
