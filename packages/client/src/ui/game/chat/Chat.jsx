//@ts-check
import React, { useRef, useEffect } from "react";
import { Grid, Input, styled } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import { useForm } from "react-hook-form";
import { messagesState, chatOpenState } from "../../../state";
import commonUIStyles from "../commonUIStyles";
import SpringScrollbars from "../../../ui/components/SpringScrollbars";
import { Message } from "./Message";
import state from "../../../bridge/state";

const Container = styled(Grid)(({ theme }) => ({
  ...commonUIStyles.uiOverlayElement,
  paddingLeft: theme.spacing(3),
}));

const ChatListGrid = styled(Grid)(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const ChatList = styled(SpringScrollbars)({
  overflow: "auto",
  maxHeight: "100%",
  pointerEvents: "all",
});

const ChatField = styled(Grid)(({ theme }) => ({
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  pointerEvents: "all",
  padding: 5,
}));

const ChatInput = styled(Input)(({ theme }) => ({
  padding: theme.spacing(1, 1, 1, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
}));

export default function Chat() {
  const { register, handleSubmit, reset } = useForm();

  const inputRef = useRef(null);

  const [isActive, setActive] = useRecoilState(chatOpenState);

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

  const messages = useRecoilValue(messagesState);

  const onSubmit = (values) => {
    if (values.content !== "") {
      state.connection.chat(values.content);
    }

    closeChat();
  };

  return (
    <Container container direction="column" justifyContent="flex-end" alignItems="flex-start">
      <ChatListGrid item>
        <ChatList
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
        </ChatList>
      </ChatListGrid>

      {isActive && (
        <ChatField item>
          <div>
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
          </div>
        </ChatField>
      )}
    </Container>
  );
}
