import React, { useLayoutEffect, useRef } from "react";
import { styled } from "@mui/system";
import { blockInspectorGlobal, blockPositionSelector } from "../../state/blockInspector";
import { useRecoilValue } from "recoil";
import { useGameState } from "../hooks";
import { TileLayer } from "@smiley-face-game/api";
import { Grid } from "@mui/material";
import BlockPreview from "./blockbar/BlockPreview";
import { GameState } from "../../bridge/state";
import { ZHeap } from "@smiley-face-game/api/types";

const CenteredTextGrid = styled(Grid)({
  textAlign: "center",
});

// https://stackoverflow.com/a/1777282/3780113
const CenteredDiv = styled("div")({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  left: "-50%",
  top: "4px",
  userSelect: "none",
});

const InnerDiv = styled("div")({
  top: "4px",
  backgroundColor: "rgb(123,123,123)",
  padding: "0.25em",
  borderRadius: "4px",
  borderWidth: "0px",
});

// https://css-tricks.com/snippets/css/css-triangle/
const TriangleDiv = styled("div")({
  //   position: "relative",
  width: 0,
  height: 0,
  //   left: "-50%",
  margin: "auto",
  borderLeft: "8px solid transparent",
  borderRight: "8px solid transparent",
  borderBottom: "8px solid rgb(123,123,123)",
});

const getBlockInfo = (
  { game: { blocks, tiles } }: GameState,
  x: number,
  y: number,
  layer: TileLayer
) => [tiles.forId(blocks.blockAt({ x, y }, layer)), blocks.heap.get(layer, x, y)] as const;

const BlockInspectorInner = React.memo(function BlockInspectorInner() {
  const { x, y } = useRecoilValue(blockPositionSelector);
  const game = useGameState();
  const loader = React.useCallback((id: number) => game.blockBar.load(id), []);

  const blocks = [
    getBlockInfo(game, x, y, TileLayer.Action),
    getBlockInfo(game, x, y, TileLayer.Foreground),
    getBlockInfo(game, x, y, TileLayer.Decoration),
  ];

  return (
    <Grid container flexDirection="column">
      <CenteredTextGrid item xs>
        ({x}, {y})
      </CenteredTextGrid>
      <Grid item container flexDirection="row" xs>
        {blocks.map(([block, heap], idx) => (
          <Grid key={idx} item>
            <BlockPreview block={block} loader={loader} />
            <DisplayHeap heap={heap} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
});

interface DisplayHeapProps {
  heap: 0 | ZHeap;
}

function DisplayHeap({ heap }: DisplayHeapProps) {
  if (heap === 0) return null;

  switch (heap.kind) {
    case "sign": {
      let text = heap.text ?? "";

      if (text.length > 20) {
        text = text.substring(0, 20) + "...";
      }

      return <span>Sign Information : {text}</span>;
    }
    case "switch": {
      return <span>Switch Id : {heap.id}</span>;
    }
  }
}

const initiallyHidden = { display: "none" };
/**
 * Having react manage the lifecycle of a constantly changing div is a bad idea for performance.
 * Thus, we tell React to create a div, manage and fiddle with it ourselves (without React knowing)
 * and then let react render the inside of the div via another component.
 */
export default React.memo(function BlockInspector() {
  const blockInspectorRef = useRef<HTMLDivElement>(null);
  const HALF_A_TILE = 16;
  const TILE_HEIGHT = 32;

  useLayoutEffect(() => {
    const div = blockInspectorRef.current;

    blockInspectorGlobal.onValue = ({ enabled, visible, screenX, screenY }) => {
      if (!div) return;

      if (!enabled || !visible) {
        div.style.display = "none";
      } else {
        div.style.display = "flex";
        div.style.position = "absolute";
        div.style.left = `${screenX + HALF_A_TILE}px`;
        div.style.top = `${screenY + TILE_HEIGHT}px`;
      }
    };
  }, [blockInspectorRef]);

  return (
    <div ref={blockInspectorRef} style={initiallyHidden}>
      <CenteredDiv>
        <TriangleDiv />
        <InnerDiv>
          <BlockInspectorInner />
        </InnerDiv>
      </CenteredDiv>
    </div>
  );
});
