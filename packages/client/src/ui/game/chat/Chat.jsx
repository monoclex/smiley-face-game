//@ts-check
import React, { useRef, useEffect, useState } from "react";
import { Grid, Input, styled } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { chatOpen } from "../../../state";
import SpringScrollbars from "../../../ui/components/SpringScrollbars";
import { Message } from "./Message";
import state from "../../../bridge/state";
import { useGameEvent, useMutableVariable } from "@/hooks";
import { useGameState } from "@/ui/hooks";

const ChatField = styled(Grid)(({ theme }) => ({
  // borderBottomLeftRadius: theme.shape.borderRadius,
  // borderBottomRightRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
}));

const ChatInput = styled(Input)(({ theme }) => ({
  // padding: theme.spacing(1, 1, 1, 1),
  // borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
}));

export default function Chat() {
  const { register, handleSubmit, reset } = useForm();

  const inputRef = useRef(null);

  const [isActive, setActive] = useMutableVariable(chatOpen, false);

  const closeChat = () => {
    setActive(false);
    reset();
    if (inputRef.current) inputRef.current.blur();
  };

  const onKeyDown = (e) => {
    const { keyCode } = e;
    // enter key
    if (keyCode === 13 && !isActive) {
      setActive(true);
      e.preventDefault();
    }
    // escape key
    else if (keyCode === 27 && isActive) {
      closeChat();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    if (isActive) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const { game } = useGameState();
  const [messages, setMessages] = useState([]);
  const [topMessageId, setTopMessageId] = useState(0);

  useGameEvent(
    "onMessageSent",
    (packet) => {
      const time = new Date();
      const sender = game.players.get(packet.playerId);
      const content = packet.message;

      setMessages((messages) => [
        ...messages,
        {
          id: topMessageId,
          time,
          sender: sender.cheap(),
          content,
        },
      ]);

      setTopMessageId((id) => id + 1);
    },
    [game, topMessageId, setMessages, setTopMessageId]
  );

  const onSubmit = (values) => {
    if (values.content !== "") {
      state.connection.chat(values.content);
    }

    closeChat();
  };

  return (
    <Grid container direction="column" style={{ height: "100%" }}>
      <Grid item>
        {isActive && (
          <ChatField item>
            <form
              autoComplete="off"
              onSubmit={async (e) => {
                return await handleSubmit(onSubmit)(e);
              }}
            >
              <ChatInput
                disableUnderline
                fullWidth
                id="content"
                {...register("content")}
                name="content"
                placeholder="Press Enter to chat"
                onFocus={() => setActive(true)}
                onBlur={closeChat}
                inputRef={inputRef}
              />
            </form>
          </ChatField>
        )}
      </Grid>

      <Grid item xs style={{ height: "100%" }}>
        <SpringScrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          renderThumbVertical={({ style, ...props }) => (
            <div {...props} style={{ ...style, backgroundColor: "rgb(48,48,48)" }} />
          )}
        >
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </SpringScrollbars>
      </Grid>
    </Grid>
  );
}
