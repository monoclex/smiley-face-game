import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
  block: {
    '&:hover': {
      backgroundColor: 'green',
    },
  },

  image: {
    width: 32,
    height: 32,
    pointerEvents: 'all',
    '&:hover': {
      width: 64,
      height: 64,
    }
  },

  // the line height on grid item that contains the image causes the size of the div to be 32x35.(...), which is a result of the
  // line height affecting the height
  // this removes it so that the div is exactly 32x32
  removeLineHeight: {
    lineHeight: '1px'
  }
})

export interface BlockProps {
  slot: string;
}

const Block: React.FC<BlockProps> = (props) => {
  const { slot } = props;
  const styles = useStyles();

  return (
    <Grid className={styles.block} direction="column">
      <Grid item container justify="center">
        <span>{slot}</span>
      </Grid>
      <Grid item className={styles.removeLineHeight}>
        <img className={styles.image} src="https://www.w3schools.com/howto/img_snow_wide.jpg" />
      </Grid>
    </Grid>
  );
};

export default Block;