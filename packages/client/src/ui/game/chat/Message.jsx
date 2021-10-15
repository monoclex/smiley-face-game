import React from "react";
import { makeStyles } from "@mui/styles";
import { format } from "date-fns/fp";

const useStyles = makeStyles(() => ({
  message: {
    paddingTop: 2,
    paddingLeft: 4,
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 2,
  },
}));

export const Message = ({ message }) => {
  const classes = useStyles();

  return (
    <div className={classes.message}>
      <small>{format("HH:mm:ss", message.time)}</small>
      <span>
        <b>{` ${message.sender.username}: `}</b>
        {`${message.content}`}
      </span>
    </div>
  );
};
