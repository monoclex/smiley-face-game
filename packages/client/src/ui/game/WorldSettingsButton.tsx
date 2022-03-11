//@ts-check
import React, { useRef, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material";
import WorldSettingsDialog from "./WorldSettingsDialog";
import { currentPlayerState, settingsOpen } from "../../state";
import { Cog } from "mdi-material-ui";

const CogIconButton = styled(IconButton)({
  pointerEvents: "all",
});

const WorldSettingsButton = () => {
  const mainPlayer = useRecoilValue(currentPlayerState);
  const ref = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  settingsOpen.value = open;

  const onClose = () => setOpen(false);
  const doOpen = () => {
    if (ref.current !== null) ref.current.blur();
    else throw new Error("impossible");
    setOpen(true);
  };

  // if the player isn't the owner, they shouldn't have access to world settings
  if (mainPlayer === undefined || mainPlayer.role !== "owner") {
    return null;
  }

  return (
    <>
      <CogIconButton
        ref={ref}
        // TODO: what does it want here?
        // variant="contained"
        aria-haspopup="true"
        onClick={doOpen}
        color="primary"
        aria-label="world settings"
        // TODO: what does it want here?
        // component="span"
        size="large"
      >
        <Cog />
      </CogIconButton>
      <WorldSettingsDialog open={open} onClose={onClose} />
    </>
  );
};

export default WorldSettingsButton;
