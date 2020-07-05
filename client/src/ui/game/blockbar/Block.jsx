import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";

const useStyles = makeStyles({
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
    imageRendering: 'pixelated',
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

const Block = (props) => {
  const styles = useStyles(props);
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (!props.loader) return;

    props.loader(props.slotId)
      .then(image => {
        setImageSource(image.src);
      });
  }, [props.loader]);

  if (!props.loader || !imageSource) {
    return null;
  }

  return (
    <Grid className={clsx({
      [styles.selected]: props.selected,
      [styles.blockBlue]: !props.selected
    })}>
      <Grid item container justify="center">
        <span>{props.slot}</span>
      </Grid>
      <Grid item className={styles.removeLineHeight}>
        <img className={styles.image} onClick={props.onClick} src={imageSource} />
      </Grid>
    </Grid>
  );
};

export default Block;
