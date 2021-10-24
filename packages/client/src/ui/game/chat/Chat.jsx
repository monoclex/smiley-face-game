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
  paddingLeft: 5,
  paddingRight: 5,
  width: "40%",
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
  width: "40%",
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
    if (isActive) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const messages = useRecoilValue(messagesState);

  const onSubmit = (values) => {
    if (values.content !== "") {
      state.game.connection.chat(values.content);
    }

    reset();
    inputRef.current.blur();
    setActive(false);
  };

  return (
    <Container container direction="column" justifyContent="flex-end" alignItems="flex-start">
      <ChatListGrid item>
        <ChatList autoHeight autoHeightMin={0} autoHeightMax={400} autoHide autoHideTimeout={1000} autoHideDuration={200}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </ChatList>
      </ChatListGrid>

      {isActive && (
        <ChatField item>
          <div>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <ChatInput
                disableUnderline
                fullWidth
                id="content"
                name="content"
                placeholder="Press Enter to chat"
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                {...register("content")}
                inputRef={(ref) => {
                  // register(ref);
                  inputRef.current = ref;
                }}
              />
            </form>
          </div>
        </ChatField>
      )}
    </Container>
  );
}
