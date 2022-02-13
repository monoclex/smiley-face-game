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

const SlotName = styled("span")({
  userSelect: "none",
});

interface ImageProps {
  src: string;
}

const BlockPreview = styled("img")<ImageProps>(({ src }) => ({
  width: 32,
  height: 32,
  pointerEvents: "all",
  imageRendering: "pixelated",
  backgroundImage: src,
}));

interface PreviewProps {
  selected: boolean;
}

const VisualCued = styled("div")<PreviewProps>(({ selected }) => ({
  borderColor: "white",
  borderWidth: "1px",
  // margin to work around the div changing size
  margin: !selected ? "1px" : "0pxd",
  borderStyle: selected ? "solid" : "none",
  "&:hover": {
    margin: "0px",
    borderStyle: selected ? "solid" : "dotted",
  },
}));

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
    <VisualCued onClick={handleClick} selected={props.selected}>
      <Grid item container justifyContent="center">
        <SlotName>{props.slot}</SlotName>
      </Grid>
      <LineheightlessGrid item>
        <BlockPreview src={imageSource} draggable={false} />
      </LineheightlessGrid>
    </VisualCued>
  );
};

export default Block;
