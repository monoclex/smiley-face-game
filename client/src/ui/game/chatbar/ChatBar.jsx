import React from "react";
import { Divider, Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { motion } from "framer-motion";

const useStyles = makeStyles({
  container: {
    paddingRight: 5,
    overflow: "hidden",
    maxHeight: "90%",
  },
  paper: {
    pointerEvents: "all",
    width: 150,
  },
  alignText: {
    textAlign: "center",
  },
});

export default ({}) => {
  const classes = useStyles();

  return (
    <Grid container justify="flex-end" alignItems="center" className={classes.container}>
      <Grid item>
        <motion.div animate={{ translateX: 135 }} whileHover={{ translateX: 0 }}>
          <Paper className={classes.paper}>
            <Grid container direction="column" className={classes.alignText}>
              <Grid item>
                <h1>Chat</h1>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item>
                <h4>Well,</h4>
              </Grid>
              <Grid item>
                <h4>Hello</h4>
              </Grid>
              <Grid item>
                <h4>There</h4>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Grid>
    </Grid>
  );
};
