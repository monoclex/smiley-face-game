//@ts-check
import { styled } from "@mui/material";
import { format } from "date-fns/fp";

const MessageContainer = styled("div")({
  message: {
    paddingTop: 2,
    paddingLeft: 4,
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 2,
  },
});

export const Message = ({ message }) => {
  return (
    <MessageContainer>
      <small>{format("HH:mm:ss", message.time)}</small>
      <span>
        <b>{` ${message.sender.username}: `}</b>
        {`${message.content}`}
      </span>
    </MessageContainer>
  );
};
