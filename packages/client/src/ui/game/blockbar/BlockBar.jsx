//@ts-check
import { useEffect } from "react";

import { Grid } from "@mui/material";
import Block from "./Block";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentPlayerState, blockBarState } from "../../../state/";
import state from "../../../bridge/state";
import inputEnabled from "../../../bridge/inputEnabled";

/**
 *
 * @param {number} i
 * @returns {import("../../../client/Slot").SelectedSlotId}
 */
function ensureIsSlotId(i) {
  if (i >= 0 && i <= 12) {
    //@ts-expect-error this is safe as of how SelectedSlotId is defined right now
    return i;
  }
  throw new Error("is not slot id");
}

const BlockBar = ({ loader }) => {
  const keys = "`1234567890-=".split("");

  const [blockbar, setBlockbar] = useRecoilState(blockBarState);

  useEffect(() => {
    const listener = (keyboardEvent) => {
      if (!inputEnabled()) return;

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
        const newTileState = state.game.tileJson.for(blockbar.slots[slot]).next(blockbar.slots[slot]);
        setBlockbar({ ...blockbar, slots: { ...blockbar.slots, [slot]: newTileState } });
      } else {
        setBlockbar({ ...blockbar, selected: slot });
      }
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [blockbar]);

  const self = useRecoilValue(currentPlayerState);
  if (self.role === "non") return null;

  return (
    <Grid item container justifyContent="center" alignItems="flex-end">
      {keys.map((key, i) => (
        <Block
          key={i}
          slot={key}
          slotId={i}
          block={blockbar.slots[i]}
          nextState={() => {
            const newTileState = state.game.tileJson.for(blockbar.slots[i]).next(blockbar.slots[i]);
            setBlockbar({ ...blockbar, slots: { ...blockbar.slots, [i]: newTileState } });
          }}
          onClick={() => setBlockbar({ ...blockbar, selected: ensureIsSlotId(i) })}
          selected={blockbar.selected === i}
          loader={loader}
        />
      ))}
    </Grid>
  );
};

export default BlockBar;
