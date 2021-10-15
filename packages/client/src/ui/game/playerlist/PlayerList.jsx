//@ts-check
import React, { useEffect, useState } from "react";
import { Paper, Grid, styled } from "@mui/material";
import { motion } from "framer-motion";
import clsx from "clsx";
import withSize from "react-sizeme";
const { SizeMe } = withSize;
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

const PlayerList = ({}) => {
  const [duration, setDuration] = useState(0);

  // for duration, we want to set the duration back to 0.3 once it's done
  // so we set the duration to 0.3 at some point *later*, so that the animation duration is correct
  useEffect(() => {
    setTimeout(() => {
      setDuration(0.3);
    });
  }, []);

  const players = useRecoilValue(playerListState);

  return (
    <Container container justifyContent="flex-end" alignItems="center">
      <Grid item>
        <SizeMe>
          {({ size }) => (
            <motion.div
              // if we don't have the size yet, hide the component so that
              // instead of being fully visible and then getting shifted to the right side of the screen,
              // it goes from being invisible to popping up. it makes it less jarring
              // TODO: use `sx` magic
              // className={clsx(!size.width && classes.hide)}
              // the '0' never matters here. we just ensure we have the size
              animate={{ translateX: size.width ? size.width - 30 : 0 }}
              // while we hover, we reset the tranlateX thing we did
              whileHover={{ translateX: 0 }}
              // if we don't set the duration of the transition to 0 initially, as soon as the component becomes visible it'll
              // still be jarring and make the jump. see where duration is defined for more info
              transition={{ duration }}
            >
              <PlayerListContainer>
                <Grid container direction="column">
                  <Grid item>
                    <ChatList autoHeight autoHeightMin={0} autoHeightMax={400} autoHide autoHideTimeout={1000} autoHideDuration={200}>
                      {players.map((player, i) => (
                        <Player key={i} {...player} />
                      ))}
                    </ChatList>
                  </Grid>
                </Grid>
              </PlayerListContainer>
            </motion.div>
          )}
        </SizeMe>
      </Grid>
    </Container>
  );
};

export default PlayerList;
