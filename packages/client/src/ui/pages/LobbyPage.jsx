//@ts-check
import React, { useState, useEffect } from "react";
import * as qs from "query-string";
import { makeStyles } from "@material-ui/core/styles";
import history from "@/ui/history";
import { api } from "@/isProduction";

const useStyles = makeStyles({

});

export default ({ location: { search } }) => {
  const { token } = qs.parse(search);

  const styles = useStyles();

  const [onlineRooms, setOnlineRooms] = useState([]);

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    setOnlineRooms([]);

    api.getLobby(token).then(setOnlineRooms);
  }, []);

  return (
    <>
      <a onClick={() => history.push("/games/?name=ROOM&width=50&height=50&token=" + encodeURIComponent(token))}>
        new room
      </a>
      {onlineRooms.map(preview => (
        <div>
          <p>{ preview.name } - { preview.playerCount } online.</p>
          <a onClick={() => history.push("/games/" + preview.id + "?type=" + preview.type + "&token=" + encodeURIComponent(token))}>
            play now
          </a>
        </div>
      ))}
    </>
  );
};
