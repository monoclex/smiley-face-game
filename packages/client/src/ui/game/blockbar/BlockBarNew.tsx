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
import SpringScrollbars from "@/ui/components/SpringScrollbars";

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

  lineHeight: 0, // removes some weird spacing below the block

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
  margin: 0,
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  padding: 0,
}));

interface BlockPackWidgetProps {
  pack: Readonly<PackInfo>;
  draggableHandleClassName: string;
  selectedBlockId: number;
  setSelectedBlock: (block: BlockInfo) => void;
}

function BlockPackWidget({
  pack,
  draggableHandleClassName,
  selectedBlockId,
  setSelectedBlock,
}: BlockPackWidgetProps) {
  const onBlockSelected = (id: number) => {
    const block = pack.blocks.find((block) => block.id === id);
    if (!block) throw new Error("Unknown block selected " + id);

    setSelectedBlock(block);
  };

  return (
    <Grid
      key={pack.name}
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      style={{
        backgroundColor: "#242424",
        margin: 0,
        paddingLeft: "8px",
      }}
      flexWrap="nowrap"
    >
      <Grid item className={draggableHandleClassName}>
        <Typography variant="subtitle1" component="div">
          {pack.name}
        </Typography>
      </Grid>

      <Grid item>
        <Separator />
      </Grid>

      <SpringScrollbars
        style={{
          margin: 0,
          paddingLeft: "8px",
        }}
      >
        <Grid item container justifyContent="center" flexWrap="wrap">
          {pack.blocks.map((block) => {
            return (
              <Grid item key={block.id}>
                <BlockImage
                  onSelect={onBlockSelected}
                  selected={selectedBlockId === block.id}
                  id={block.id}
                />
              </Grid>
            );
          })}
        </Grid>
      </SpringScrollbars>
    </Grid>
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

  const COLUMNS = 32;

  const layout = useMemo(() => {
    // before `w` was determined by their numbers in a 12 column grid
    // we use this to make it adapt to an `n` (where n = 32) grid instead
    const MULT = COLUMNS / 12;

    return packs.map((x, i) => ({
      i: x.name,
      minW: 1,
      minH: 2,
      w: 2 * MULT,
      h: 2 + x.blocks.length / 6,
      x: ((i * 2) % 12) * MULT,
      y: Infinity, // puts it at the bottom
    }));
  }, []);

  return (
    <SpringScrollbars>
      <GridLayout
        className="layout"
        layout={layout}
        cols={COLUMNS}
        rowHeight={32}
        width={width}
        isBounded={true}
        onLayoutChange={console.log}
        draggableHandle={`.${styles.classes.draggableHandle}`}
      >
        {packs.map(
          (pack: PackInfo) =>
            BlockPackWidget({
              // key: pack.name,
              pack: pack,
              draggableHandleClassName: styles.classes.draggableHandle,
              selectedBlockId: selectedBlock?.id ?? 0,
              setSelectedBlock: setSelectedBlock,
            })
          // <BlockPackWidget
          //   key={pack.name}
          //   pack={pack}
          //   draggableHandleClassName={styles.classes.draggableHandle}
          //   selectedBlockId={selectedBlock?.id ?? 0}
          //   setSelectedBlock={setSelectedBlock}
          // />
        )}
      </GridLayout>
    </SpringScrollbars>
  );
}
