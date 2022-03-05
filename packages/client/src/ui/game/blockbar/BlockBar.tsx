//@ts-check
import React, { useEffect, useState } from "react";

import { Grid } from "@mui/material";
import { useRecoilValue } from "recoil";

import Block from "./Block";
import { currentPlayerState, selectedBlockState, SelectedBlock } from "../../../state/";
import inputEnabled from "../../../bridge/inputEnabled";
import { useGameState } from "../../hooks";

// prettier-ignore
const map = {
  "`": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "0": 10, "-": 11, "=": 12, "[": 13,
  "~": 0, "!": 1, "@": 2, "#": 3,   $: 4, "%": 5, "^": 6, "&": 7, "*": 8, "(": 9, ")": 10,   _: 11, "+": 12, "{": 13,
};

function isMapIndex(s: string): s is keyof typeof map {
  return s in map;
}

const keys = "`1234567890-=[".split("");

const MemoizedBlock = React.memo(Block);
MemoizedBlock.whyDidYouRender = false;

const BlockBar = () => {
  const self = useRecoilValue(currentPlayerState);
  const [currentSlot, setCurrentSlot] = useState<undefined | number>(undefined);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock>(undefined);
  selectedBlockState.it = selectedBlock;
  const state = useGameState();

  const tiles = state.game.tiles;
  const blockBar = state.blockBar;

  const [slots] = useState(() =>
    tiles.packs.filter((pack) => pack.visible).map((pack) => ({ pack, entry: 0 }))
  );

  const selectSlot = React.useCallback((slotIdx: number, moveDir = 1) => {
    const slot = slots?.[slotIdx];
    if (!slot) return;

    let block = slot.pack.blocks[slot.entry];

    // if we're selecting the same slot, rotate the block
    if (block === selectedBlockState.it) {
      slot.entry += moveDir;
      if (slot.entry >= slot.pack.blocks.length) {
        slot.entry = 0;
      }
      if (slot.entry < 0) {
        slot.entry = slot.pack.blocks.length - 1;
      }

      // n.b. this actually doesn't do anything because it's the same reference
      // we mutated slots
      // setSlots(slots);

      block = slot.pack.blocks[slot.entry];
    }

    // switch to new block
    setCurrentSlot(slotIdx);
    setSelectedBlock(block);
    state.mouseInteraction.triggerBlockChange(block.textureId);
  }, []);

  useEffect(() => {
    const handler = (event: WheelEvent) => {
      if (!state.mouseInteraction.mouseInGame) return;
      if (currentSlot == null) return;

      const delta = event.deltaY;
      const isUp = delta < 0;
      const isDown = delta > 0;

      if (isUp) {
        selectSlot(currentSlot, 1);
      } else if (isDown) {
        selectSlot(currentSlot, -1);
      }
    };

    document.addEventListener("wheel", handler);
    return () => document.removeEventListener("wheel", handler);
  });

  const loaderLoad = React.useCallback((id: number) => blockBar.load(id), []);

  useEffect(() => {
    const listener = (keyboardEvent: KeyboardEvent) => {
      if (!inputEnabled()) return;

      const key = keyboardEvent.key;
      if (!isMapIndex(key)) return;

      const slot = map[key];
      selectSlot(slot);
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [slots]);

  if (self.role === "non") return null;

  return (
    <Grid container justifyContent="center">
      {keys.map(
        (key, i) =>
          slots[i] && (
            <MemoizedBlock
              key={i}
              slot={key}
              slotId={i}
              block={slots[i].pack.blocks[slots[i].entry]}
              selectSlot={selectSlot}
              selected={slots[i].pack.blocks[slots[i].entry] === selectedBlock}
              loader={loaderLoad}
            />
          )
      )}
    </Grid>
  );
};

export default BlockBar;
