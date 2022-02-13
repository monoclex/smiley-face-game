//@ts-check
import React, { useEffect, useState } from "react";

import { Grid } from "@mui/material";
import Block from "./Block";
import { useRecoilValue } from "recoil";
import { currentPlayerState, selectedBlockState, SelectedBlock } from "../../../state/";
import inputEnabled from "../../../bridge/inputEnabled";
import { useGameState } from "../../hooks";

// prettier-ignore
const map = {
  "`": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "0": 10, "-": 11, "=": 12,
  "~": 0, "!": 1, "@": 2, "#": 3,   $: 4, "%": 5, "^": 6, "&": 7, "*": 8, "(": 9, ")": 10,   _: 11, "+": 12,
};

function isMapIndex(s: string): s is keyof typeof map {
  return s in map;
}

const keys = "`1234567890-=".split("");

// TODO(SirJosh): make this more performant lol
//   and if you see this pester me about it because i really do want to do some
//   performance optimization (i've been deprived of optimizing for a while)
const BlockBar = () => {
  const self = useRecoilValue(currentPlayerState);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock>(undefined);
  selectedBlockState.it = selectedBlock;
  const state = useGameState();

  const tiles = state.game.tiles;
  const blockBar = state.blockBar;

  const [slots, setSlots] = useState(() => [
    { pack: tiles.emptyPack, entry: 0 },
    ...tiles.packs.map((pack) => ({ pack, entry: 0 })),
  ]);

  function selectSlot(slotIdx: number) {
    const slot = slots?.[slotIdx];
    if (!slot) return;

    let block = slot.pack.blocks[slot.entry];

    // if we're selecting the same slot, rotate the block
    if (block === selectedBlockState.it) {
      slot.entry += 1;
      if (slot.entry >= slot.pack.blocks.length) {
        slot.entry = 0;
      }

      // we mutated slots
      setSlots(slots);

      block = slot.pack.blocks[slot.entry];
    }

    // switch to new block
    setSelectedBlock(block);
  }

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
    <Grid item container justifyContent="center">
      {keys.map(
        (key, i) =>
          slots[i] && (
            <Block
              key={i}
              slot={key}
              slotId={i}
              block={slots[i].pack.blocks[slots[i].entry]}
              nextState={() => selectSlot(i)}
              onClick={() => selectSlot(i)}
              selected={slots[i].pack.blocks[slots[i].entry] === selectedBlock}
              loader={(id) => blockBar.load(id)}
            />
          )
      )}
    </Grid>
  );
};

export default BlockBar;
