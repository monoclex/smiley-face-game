//@ts-check

import React from "react";
import { Grid, ListItem, ListItemText, List } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import uiOverlayElement from "../styleBoilerplate";

const useStyles = makeStyles((theme) => ({
  ...uiOverlayElement,
  root: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  child: {
    marginTop: 2,
    marginBottom: 2,
  },
  item: {
    backgroundColor: theme.palette.background.default + "39", // TODO: make it clean (theme.palette.background.default is a hex rgb value, so we add 39 to it to add transparency)
    color: theme.palette.text.primary,
  },
}));

const messages = [
  {
    username: "test",
    content: "lorem",
  },
  {
    username: "test",
    content: "ipsum",
  },
  {
    username: "test",
    content: "dolor",
  },
  {
    username: "test",
    content: "sit",
  },
  {
    username: "test",
    content: "amet,",
  },
  {
    username: "test",
    content: "consectetur",
  },
];

// @ts-ignore
const Message = ({ index }) => {
  const classes = useStyles();

  return (
    <ListItem key={index} className={classes.root} divider dense>
      <ListItemText className={classes.child} primary={`${messages[index].username}: ${messages[index].content}`} />
    </ListItem>
  );
};

export default () => {
  const classes = useStyles();

  return (
    <Grid container justify="flex-start" alignItems="flex-end" className={classes.uiOverlayElement}>
      <Grid item xs={6} className={classes.item}>
        <List>
          {[0, 1, 2, 3, 4, 5].map((id) => (
            <Message key={id} index={id} />
          ))}
        </List>
      </Grid>
    </Grid>
  );
};
