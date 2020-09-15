//@ts-check

import React, { useState } from "react";
import { Grid, ListItem, ListItemText, List, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { format } from "date-fns/fp";

import { messagesState, chatState } from "@/recoil/atoms/chat";
import commonUIStyles from "../commonUIStyles";

const useStyles = makeStyles((theme) => ({
  container: {
    ...commonUIStyles.uiOverlayElement,
    paddingLeft: theme.spacing(3),
  },
  chatList: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default + "20", // TODO: make this clean (theme.palette.background.default is a hex rgb value, so we add 39 to it to add transparency)
    width: "40%",
  },
  chatRootItem: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
  },
  chatChildItem: {
    marginTop: 2,
    marginBottom: 2,
  },
  chatField: {
    backgroundColor: theme.palette.background.default + "20", // TODO: make this clean (theme.palette.background.default is a hex rgb value, so we add 39 to it to add transparency)
    pointerEvents: "all",
    width: "40%",
  },
}));

const Message = ({ id }) => {
  const classes = useStyles();
  const message = useRecoilValue(messagesState)[id];

  return (
    <ListItem key={id} className={classes.chatRootItem} divider dense>
      <div className={classes.chatChildItem}>
        <span>{format("HH:mm:ss", message.timestamp)}</span>
        <span>{` ${message.username}: ${message.content}`}</span>
      </div>
    </ListItem>
  );
};

export default () => {
  const classes = useStyles();
  const { register, handleSubmit, reset } = useForm();

  const setChatState = useSetRecoilState(chatState);

  const messages = useRecoilValue(messagesState);
  const setMessages = useSetRecoilState(messagesState);
  const addMessage = ({ content }) =>
    setMessages((old) => [
      {
        id: old.length,
        timestamp: new Date().getTime(),
        username: "yes",
        content,
      },
      ...old,
    ]);

  return (
    <Grid container direction="column" justify="flex-end" alignItems="flex-start" className={classes.container}>
      <Grid item className={classes.chatList}>
        <List>
          {messages.map((message) => (
            <Message key={message.id} id={message.id} />
          ))}
        </List>
      </Grid>

      <Grid item className={classes.chatField}>
        <form onSubmit={handleSubmit(addMessage)} autoComplete="off">
          <TextField
            fullWidth
            size="small"
            id="content"
            name="content"
            label="Message"
            placeholder="Press Enter to chat"
            onFocus={() => setChatState((old) => ({ ...old, isActive: true }))}
            onBlur={() => setChatState((old) => ({ ...old, isActive: false }))}
            inputRef={register({ required: true })}
            onKeyUp={(event) => event.key === "Enter" && reset()}
          />
        </form>
      </Grid>
    </Grid>
  );
};
