import React, { useRef, useEffect } from "react";
import { Grid, Input } from "@material-ui/core";
import { makeStyles, fade } from "@material-ui/core/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import { useForm } from "react-hook-form";
import { messagesState, chatOpenState } from "../../../state";
import commonUIStyles from "../commonUIStyles";
import SpringScrollbars from "../../../ui/components/SpringScrollbars";
import { Message } from "./Message";
import state from "../../../bridge/state";

const useStyles = makeStyles((theme) => ({
  container: {
    ...commonUIStyles.uiOverlayElement,
    paddingLeft: theme.spacing(3),
  },
  containerNotActive: {
    display: "none",
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
}));

export default function Chat() {
  const classes = useStyles();
  const { register, handleSubmit, reset } = useForm();

  const inputRef = useRef();

  const [isActive, setActive] = useRecoilState(chatOpenState);

  const onKeyDown = ({ keyCode }) => {
    // enter key
    if (keyCode === 13 && !isActive) {
      setActive(true);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isActive.isActive) {
      inputRef.current.focus();
    }
  }, [isActive.isActive]);

  const messages = useRecoilValue(messagesState);

  const onSubmit = (values) => {
    if (values.content !== "") {
      state.game.connection.chat(values.content);
    }

    reset();
    inputRef.current.blur();
  };

  return (
    <Grid container direction="column" justify="flex-end" alignItems="flex-start" className={classes.container}>
      <Grid item className={classes.chatListGrid}>
        <SpringScrollbars
          className={classes.chatList}
          autoHeight
          autoHeightMin={0}
          autoHeightMax={400}
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
        >
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </SpringScrollbars>
      </Grid>

      {isActive.isActive && (
        <Grid item className={classes.chatField}>
          <div>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <Input
                className={classes.chatInput}
                disableUnderline
                fullWidth
                id="content"
                name="content"
                placeholder="Press Enter to chat"
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                inputRef={(ref) => {
                  register(ref);
                  inputRef.current = ref;
                }}
              />
            </form>
          </div>
        </Grid>
      )}
    </Grid>
  );
}
