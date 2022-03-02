//@ts-check
import React from "react";
import { styled } from "@mui/material";
import { format } from "date-fns/fp";

const MessageContainer = styled("div")({
  paddingTop: "0.5mm",
  paddingLeft: "1mm",
  paddingBottom: "0.5mm",
  backgroundColor: "rgb(18, 18, 18)",
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
