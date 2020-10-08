import React from "react";
import { useEffect } from "react";
import { Grid } from "@material-ui/core";
import Block from "./Block";
import { useRecoilState } from "recoil";
import { blockbar as blockbarGlobal, blockbarState } from "../../../recoil/atoms/blockbar";
import nextTileState from "@smiley-face-game/common/tiles/nextTileState";

const BlockBar = () => {
  const keys = "`1234567890-=".split("");

  const [blockbar, setBlockbar] = useRecoilState(blockbarState);

  useEffect(() => {
    const listener = (keyboardEvent) => {
      const map = {
        "`": 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        0: 10,
        "-": 11,
        "=": 12,
        "~": 0,
        "!": 1,
        "@": 2,
        "#": 3,
        $: 4,
        "%": 5,
        "^": 6,
        "&": 7,
        "*": 8,
        "(": 9,
        ")": 10,
        _: 11,
        "+": 12,
      };

      const slot = map[keyboardEvent.key];

      if (slot === undefined) return;

      if (blockbar.selected === slot) {
        // if we've already selected the block, we wanna go to the next state
        const newTileState = nextTileState(blockbar.slots[slot]);
        setBlockbar({ ...blockbar, slots: { ...blockbar.slots, [slot]: newTileState } });
      } else {
        setBlockbar({ ...blockbar, selected: slot });
      }
    };
    document.addEventListener("keydown", listener);

    return function () {
      document.removeEventListener("keydown", listener);
    };
  }, [blockbar]);

  return (
    <Grid item container justify="center" alignItems="flex-end">
      {keys.map((key, i) => (
        <Block
          key={i}
          slot={key}
          slotId={i}
          block={blockbar.slots[i]}
          nextState={() => {
            const newTileState = nextTileState(blockbar.slots[i]);
            setBlockbar({ ...blockbar, slots: { ...blockbar.slots, [i]: newTileState } });
          }}
          onClick={() => setBlockbar({ ...blockbar, selected: i })}
          selected={blockbar.selected === i}
          loader={blockbar.loader}
        />
      ))}
    </Grid>
  );
};

export default BlockBar;
