// @ts-check
import { Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { BlockInfo, PackInfo } from "@smiley-face-game/api/tiles/register";
import React, { useEffect, useMemo, useState } from "react";
import GridLayout from "react-grid-layout";
import { makeStyles } from "tss-react/mui";
import { selectedBlock as selectedBlockGlobal } from "../../../state";
import { useGameState } from "../../hooks";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useMutableVariable } from "@/hooks";

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

const Separator = styled("hr")(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  padding: 0,
}));

function BlockPackWidget(
  pack: Readonly<PackInfo>,
  draggableHandleClassName: string,
  selectedBlockId: number,
  setSelectedBlock: (id: number) => void
) {
  return (
    <div
      key={pack.name}
      style={{
        backgroundColor: "#242424",
        margin: 0,
        overflow: "hidden",
      }}
    >
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        <Grid item className={draggableHandleClassName}>
          <Typography gutterBottom variant="subtitle1" component="div">
            {pack.name}
          </Typography>
        </Grid>

        <Grid item>
          <Separator />
        </Grid>

        <Grid item container justifyContent="center" flexWrap="wrap">
          {pack.blocks.map((block) => {
            return (
              <Grid item key={block.id}>
                <BlockImage
                  onSelect={setSelectedBlock}
                  selected={selectedBlockId === block.id}
                  id={block.id}
                />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </div>
  );
}

type BlockBarNewProps = {
  width: number;
};

export default function BlockBarNew({ width }: BlockBarNewProps) {
  const styles = useStyles();
  const state = useGameState();

  const packs = state.game.tiles.packs.filter((x) => x.visible);
  const [selectedBlock, setSelectedBlock] = useMutableVariable(selectedBlockGlobal, undefined);

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

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={32}
      width={width}
      isBounded={true}
      onLayoutChange={console.log}
      draggableHandle={`.${styles.classes.draggableHandle}`}
    >
      {packs.map((pack: PackInfo) =>
        BlockPackWidget(pack, styles.classes.draggableHandle, selectedBlock || 0, setSelectedBlock)
      )}
    </GridLayout>
  );
}
