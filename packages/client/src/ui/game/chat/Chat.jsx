//@ts-check

import React, { useState } from "react";
import { Grid, ListItem, ListItemText, List, TextField, Input } from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { format } from "date-fns/fp";

import { messagesState, chatState } from "@/recoil/atoms/chat";
import commonUIStyles from "../commonUIStyles";
import SpringScrollbars from "@/ui/components/SpingScrollbars";

const useStyles = makeStyles((theme) => ({
  container: {
    ...commonUIStyles.uiOverlayElement,
    paddingLeft: theme.spacing(3),
  },
  chatListGrid: {
    color: theme.palette.text.primary,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    paddingLeft: 5,
    paddingRight: 5,
    width: "40%",
  },
  chatList: {
    overflow: "auto",
    maxHeight: "100%",
    pointerEvents: "all",
  },
  chatField: {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    pointerEvents: "all",
    width: "40%",
    padding: 5,
  },
  chatInput: {
    padding: theme.spacing(1, 1, 1, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
  },
  message: {
    paddingTop: 2,
    paddingLeft: 4,
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 2,
  },
}));

const Message = ({ id }) => {
  const classes = useStyles();
  const message = useRecoilValue(messagesState)[id];

  return (
    <div key={id} className={classes.message}>
      <small>{format("HH:mm:ss", message.timestamp)}</small>
      <span>
        <b>{` ${message.username}: `}</b>
        {`${message.content}`}
      </span>
    </div>
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
        username: "yes", // TODO: actually grab their username lol
        content,
      },
      ...old,
    ]);

  return (
    <Grid container direction="column" justify="flex-end" alignItems="flex-start" className={classes.container}>
      <Grid item className={classes.chatListGrid}>
        <SpringScrollbars
          className={classes.chatList}
          autoHeight
          autoHeightMin={10}
          autoHeightMax={400}
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
        >
          {messages.map((message) => (
            <Message key={message.id} id={message.id} />
          ))}
        </SpringScrollbars>
      </Grid>

      <Grid item className={classes.chatField}>
        <div>
          <form onSubmit={handleSubmit(addMessage)} autoComplete="off">
            <Input
              className={classes.chatInput}
              disableUnderline
              fullWidth
              id="content"
              name="content"
              placeholder="Press Enter to chat"
              onFocus={() => setChatState((old) => ({ ...old, isActive: true }))}
              onBlur={() => setChatState((old) => ({ ...old, isActive: false }))}
              inputRef={register({ required: true })}
              onKeyUp={(event) => event.key === "Enter" && reset()}
            />
          </form>
        </div>
      </Grid>
    </Grid>
  );
};
