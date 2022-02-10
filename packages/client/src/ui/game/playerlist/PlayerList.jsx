//@ts-check
import React from "react";
import { Paper, Grid, styled } from "@mui/material";
// import withSize from "react-sizeme";
// const { SizeMe } = withSize;
import { playerListState } from "../../../state/";
import { useRecoilValue } from "recoil";
import commonUIStyles from "../commonUIStyles";
import SpringScrollbars from "../../../ui/components/SpringScrollbars";
import { Player } from "./Player";

// so much stupid boilerplate
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserAstronaut, faUserEdit, faUserTie } from "@fortawesome/free-solid-svg-icons";

library.add(faUserAstronaut);
library.add(faUserEdit);
library.add(faUserTie);

const Container = styled(Grid)({
  ...commonUIStyles.uiOverlayElement,
  paddingRight: 5,
  overflow: "hidden",
});

const PlayerListContainer = styled(Paper)({
  pointerEvents: "none",
  minWidth: 10,
});

const ChatList = styled(SpringScrollbars)({
  overflow: "auto",
  maxHeight: "100%",
  pointerEvents: "all",
});

// const useStyles = makeStyles(() => ({
//   hide: {
//     visibility: "hidden",
//   },
// }));

const PlayerList = () => {
  const players = useRecoilValue(playerListState);

  return (
    <Container container justifyContent="flex-end" alignItems="center">
      <Grid item>
        <PlayerListContainer>
          <Grid container direction="column">
            <Grid item>
              <ChatList
                autoHeight
                autoHeightMin={0}
                autoHeightMax={400}
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
              >
                {players.map((player, i) => (
                  <Player key={i} {...player} />
                ))}
              </ChatList>
            </Grid>
          </Grid>
        </PlayerListContainer>
      </Grid>
    </Container>
  );
};

export default PlayerList;
