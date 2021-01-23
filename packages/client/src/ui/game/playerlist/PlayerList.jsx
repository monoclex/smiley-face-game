import React, { useEffect, useState } from "react";
import { Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { motion } from "framer-motion";
import clsx from "clsx";
import { SizeMe } from "react-sizeme";
import playerListState from "../../../recoil/atoms/playerList";
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

const useStyles = makeStyles(() => ({
  container: {
    ...commonUIStyles.uiOverlayElement,
    paddingRight: 5,
    overflow: "hidden",
  },
  paper: {
    pointerEvents: "none",
    minWidth: 10,
  },
  alignText: {
    textAlign: "left",
  },
  chatList: {
    overflow: "auto",
    maxHeight: "100%",
    pointerEvents: "all",
  },
  noRole: {
    width: "0.875em",
    height: "1em",
    display: "inline-block",
  },
  hide: {
    visibility: "hidden",
  },
}));

const PlayerList = ({}) => {
  const classes = useStyles();
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
    <Grid container justify="flex-end" alignItems="center" className={classes.container}>
      <Grid item>
        <SizeMe>
          {({ size }) => (
            <motion.div
              // if we don't have the size yet, hide the component so that
              // instead of being fully visible and then getting shifted to the right side of the screen,
              // it goes from being invisible to popping up. it makes it less jarring
              className={clsx(!size.width && classes.hide)}
              // the '0' never matters here. we just ensure we have the size
              animate={{ translateX: size.width ? size.width - 30 : 0 }}
              // while we hover, we reset the tranlateX thing we did
              whileHover={{ translateX: 0 }}
              // if we don't set the duration of the transition to 0 initially, as soon as the component becomes visible it'll
              // still be jarring and make the jump. see where duration is defined for more info
              transition={{ duration }}
            >
              <Paper className={classes.paper}>
                <Grid container direction="column">
                  <Grid item>
                    <SpringScrollbars
                      className={classes.chatList}
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
                    </SpringScrollbars>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </SizeMe>
      </Grid>
    </Grid>
  );
};

export default PlayerList;
