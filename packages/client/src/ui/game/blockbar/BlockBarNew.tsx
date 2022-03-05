// @ts-check
import { Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { PackInfo } from "@smiley-face-game/api/tiles/register";
import React, { useEffect, useMemo, useState } from "react";
import GridLayout from "react-grid-layout";
import { makeStyles } from "tss-react/mui";

import { selectedBlockState } from "../../../state";
import { useGameState } from "../../hooks";

const useStyles = makeStyles()({
  draggableHandle: {
    cursor: "move",
  },
});

interface StyledBlockImageProps {
  src: string;
}

const StyledBlockImage = styled("img")<StyledBlockImageProps>(({ src }) => ({
  width: 32,
  height: 32,
  pointerEvents: "all",
  imageRendering: "pixelated",
  backgroundImage: src,
}));

type VisualCuedProps = {
  selected: boolean;
};

const SelectableBlockImage = styled("div")(({ selected }: VisualCuedProps) => ({
  margin: !selected ? 1 : 0,

  borderStyle: selected ? "solid" : "none",
  borderColor: "white",
  borderWidth: 1,

  "&:hover": {
    margin: 0,
    borderStyle: selected ? "solid" : "dotted",
  },
}));

type BlockImageProps = {
  id: number;
  onSelect: (id: number) => void;
  selected: boolean;
};

function BlockImage({ id, onSelect, selected }: BlockImageProps) {
  const state = useGameState();

  const [body, setBody] = useState<HTMLImageElement | null>(null);
  const [, doRerender] = useState(false);

  useEffect(() => {
    state.blockBar.load(id).then(setBody);
  }, [state, id]);

  const handleClick = () => {
    onSelect(id);
    doRerender(true);
  };

  if (body === null) {
    return null;
  }

  return (
    <SelectableBlockImage selected={selected} onClick={handleClick}>
      <StyledBlockImage src={body.src} draggable={false} />
    </SelectableBlockImage>
  );
}

function BlockPackWidget(
  pack: Readonly<PackInfo>,
  draggableHandleClassName: string,
  setSelectedBlock: (id: number) => void
) {
  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      key={pack.name}
      style={{
        backgroundColor: "#242424",
        margin: 0,
      }}
    >
      <Grid item className={draggableHandleClassName}>
        <Typography gutterBottom variant="subtitle1" component="div">
          {pack.name}
        </Typography>
        <hr style={{ margin: 0, padding: 0 }} />
      </Grid>

      <Grid item container justifyContent="space-evenly">
        {pack.blocks.map((block) => {
          return (
            <Grid item key={block.id}>
              <BlockImage
                onSelect={setSelectedBlock}
                selected={selectedBlockState.id === block.id}
                id={block.id}
              />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}

export default function BlockBarNew() {
  const styles = useStyles();
  const state = useGameState();

  const packs = state.game.tiles.packs.filter((x) => x.visible);
  const [selectedBlock, setSelectedBlock] = useState(0);
  selectedBlockState.id = selectedBlock;

  const layout = useMemo(() => {
    return packs.map((x, i) => ({
      i: x.name,
      minW: 2,
      minH: 3,
      w: 2,
      h: 2 + x.blocks.length / 6,
      x: (i * 2) % 12,
      y: Infinity, // puts it at the bottom
    }));
  }, []);

  console.log("layout ", layout);

  return (
    <>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={32}
        width={1112}
        isBounded={true}
        onLayoutChange={console.log}
        draggableHandle={`.${styles.classes.draggableHandle}`}
      >
        {packs.map((pack: PackInfo) =>
          BlockPackWidget(pack, styles.classes.draggableHandle, setSelectedBlock)
        )}
      </GridLayout>
    </>
  );
}
