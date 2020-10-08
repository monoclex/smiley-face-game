//@ts-check
import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";
import { TileId } from "@smiley-face-game/common/schemas/TileId";
import { Rotation } from "@smiley-face-game/common/schemas/Rotation";

const useStyles = makeStyles({
  selected: {
    marginBottom: 8,
  },

  image: {
    width: 32,
    height: 32,
    pointerEvents: "all",
    imageRendering: "pixelated",
  },

  hover: {
    "&:hover": {
      marginBottom: 8,
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
  const classes = useStyles(props);
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (!props.loader) return;

    console.log("getting new block");
    props.loader(props.block).then((image) => {
      console.log("new");
      setImageSource(image.src);
    });
  }, [props.loader, props.block.id, props.block.color, props.block.rotation]);

  if (!props.loader || !imageSource) {
    return null;
  }

  const handleClick = () => {
    if (!props.selected) {
      props.onClick();
    } else {
      // this is for rotating a block in the hotbar
      props.nextState();
    }
  };

  return (
    <Grid
      className={clsx({
        [classes.selected]: props.selected,
      })}
    >
      <Grid item container justify="center">
        <span>{props.slot}</span>
      </Grid>
      <Grid item className={classes.removeLineHeight}>
        <img className={clsx(classes.image, props.selected && classes.hover)} onClick={handleClick} src={imageSource} />
      </Grid>
    </Grid>
  );
};

export default Block;
