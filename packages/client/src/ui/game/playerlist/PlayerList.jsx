//@ts-check
import React from "react";
import { Grid } from "@mui/material";
import { playerListState } from "../../../state/";
import { useRecoilValue } from "recoil";
import SpringScrollbars from "../../../ui/components/SpringScrollbars";
import { Player } from "./Player";

// so much stupid boilerplate
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserAstronaut, faUserEdit, faUserTie } from "@fortawesome/free-solid-svg-icons";

library.add(faUserAstronaut);
library.add(faUserEdit);
library.add(faUserTie);

const PlayerList = () => {
  const players = useRecoilValue(playerListState);

  return (
    <Grid container direction="column" justifyContent="flex-end" alignItems="center">
      <SpringScrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        autoHeight
        autoHeightMin={0}
        autoHeightMax={150}
        renderThumbVertical={({ style, ...props }) => (
          <div {...props} style={{ ...style, backgroundColor: "rgb(48,48,48)" }} />
        )}
      >
        {players.map((player, i) => (
          <Player key={i} {...player} />
        ))}
      </SpringScrollbars>
    </Grid>
  );
};

export default PlayerList;
