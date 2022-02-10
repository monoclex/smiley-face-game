//@ts-check
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material";
import { BlockInfo } from "@smiley-face-game/api/tiles/TileRegistration";

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
  "&:hover": { marginBottom: "8px" },
});

interface BlockProps {
  slot: string; // ={key}
  slotId: number; // ={i}
  block: BlockInfo; // ={slots[i].pack.blocks[slots[i].entry]}
  nextState: () => void; // ={() => selectSlot(i)}
  onClick: () => void; // ={() => selectSlot(i)}
  selected: boolean; // ={slots[i].pack.blocks[slots[i].entry] === selectedBlock}
  loader: (id: number) => Promise<HTMLImageElement>; // ={(id) => blockBar.load(id)}
}

const Block = (props: BlockProps) => {
  const [imageSource, setImageSource] = useState<string | null>(null);

  useEffect(() => {
    if (!props.loader) return;

    props.loader(props.block.id).then((image) => {
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
    <Grid sx={{ marginBottom: props.selected ? "8px" : 0 }}>
      <Grid item container justifyContent="center">
        <span>{props.slot}</span>
      </Grid>
      <LineheightlessGrid item>
        <BlockPreview onClick={handleClick} src={imageSource} />
      </LineheightlessGrid>
    </Grid>
  );
};

export default Block;