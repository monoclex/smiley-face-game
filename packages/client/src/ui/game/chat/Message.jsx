import React from "react";
import { useRecoilValue } from "recoil";
import { makeStyles } from "@material-ui/core/styles";
import { format } from "date-fns/fp";
import { messagesState } from "../../../recoil/atoms/chat";

const useStyles = makeStyles((theme) => ({
  message: {
    paddingTop: 2,
    paddingLeft: 4,
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 2,
  },
}));

export const Message = ({ id }) => {
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
