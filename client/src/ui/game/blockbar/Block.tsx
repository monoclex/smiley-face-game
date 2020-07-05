import * as React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";

const useStyles = makeStyles<Theme, BlockProps>({
  selected: {
    backgroundColor: "green",
  },

  // TODO: name
  blockBlue: {
    "&:hover": {
     backgroundColor: "blue"
    }
  },

  image: {
    width: 32,
    height: 32,
    pointerEvents: "all",
    "&:hover": {
      width: 64,
      height: 64,
    },
  },

  // the line height on grid item that contains the image causes the size of the div to be 32x35.(...), which is a result of the
  // line height affecting the height
  // this removes it so that the div is exactly 32x32
  removeLineHeight: {
    lineHeight: "1px",
  },
});

export interface BlockProps {
  slot: string;
  onClick?: () => void;
  selected: boolean;
}

const Block: React.FC<BlockProps> = (props) => {
  const styles = useStyles(props);
  console.log("props ", props);

  return (
    <Grid className={clsx({
      [styles.selected]: props.selected,
      [styles.blockBlue]: !props.selected
    })}>
      <Grid item container justify="center">
        <span>{props.slot}</span>
      </Grid>
      <Grid item className={styles.removeLineHeight}>
        <img className={styles.image} onClick={props.onClick} src="https://www.w3schools.com/howto/img_snow_wide.jpg" />
      </Grid>
    </Grid>
  );
};

export default Block;
