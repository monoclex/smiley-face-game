import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import { VolumeHigh, VolumeOff } from "mdi-material-ui";
import { audio, volume } from "../../bridge/PlayerJoinLeaveSoundEffects";

const MILLISECONDS = 1 / 1000;

export default function SoundButton() {
  const [mode, setMode] = useState<"on" | "off">("on");

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current !== null) ref.current.blur();
    if (mode === "on") {
      volume.gain.linearRampToValueAtTime(1, audio.currentTime + 200 * MILLISECONDS);
    } else {
      volume.gain.linearRampToValueAtTime(0, audio.currentTime + 200 * MILLISECONDS);
    }
  }, [mode]);

  return (
    <IconButton
      ref={ref}
      aria-haspopup="false"
      onClick={() => {
        if (mode === "on") {
          setMode("off");
        } else {
          setMode("on");
        }
      }}
      color="primary"
      aria-label="mute sound"
      size="large"
    >
      {mode === "on" ? <VolumeHigh /> : <VolumeOff />}
    </IconButton>
  );
}
