//@ts-check
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material";

const Selected = styled(Grid)({
  marginBottom: 8,
});
// so that this doesn't get ripped out, cuz we need it later for refactors
console.log(Selected);

const LineheightlessGrid = styled(Grid)({
  // the line height on grid item that contains the image causes the size of the div to be 32x35.(...), which is a result of the
  // line height affecting the height
  // this removes it so that the div is exactly 32x32
  lineHeight: "1px",
});

const BlockPreview = styled("img")({
  width: 32,
  height: 32,
  pointerEvents: "all",
  imageRendering: "pixelated",
  // TODO: include this for selected blocks
  // hover: {
  //   "&:hover": {
  //     marginBottom: 8,
  //   },
  // },
});

const Block = (props) => {
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (!props.loader) return;

    props.loader(props.block).then((image) => {
      setImageSource(image.src);
    });
  }, [props.loader, props.block]);

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
    // TODO: conditionally apply "Selected"
    // className={clsx({
    //   [classes.selected]: props.selected,
    // })}
    >
      <Grid item container justifyContent="center">
        <span>{props.slot}</span>
      </Grid>
      <LineheightlessGrid item>
        {/* TODO: for block previews, add code if they're selected */}
        <BlockPreview onClick={handleClick} src={imageSource} />
      </LineheightlessGrid>
    </Grid>
  );
};

export default Block;
