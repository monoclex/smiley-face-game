import state from "@/bridge/state";
import React, { useState, useRef, useEffect } from "react";
import { loopRequestAnimationFrame } from "@smiley-face-game/api/physics/simulatePhysics";
import { styled } from "@mui/system";
import ConnectToGame from "./ConnectToGame";

const EntireDiv = styled("div")({
  width: "100%",
  height: "100%",
  // TODO: why is this here?
  lineHeight: "1px",
});

export default function GameArea() {
  const [gameElement] = useState(() => {
    const gameElement = document.createElement("canvas");
    gameElement.oncontextmenu = () => false; // don't show inspect on right click
    return gameElement;
  });

  const divRef = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = () => {
    // forcibly coerce a known only `undefined` to `typeof current`
    /** @type {any} */
    const expr = divRef.current;
    /** @type {HTMLDivElement | undefined} */
    const current = expr;
    if (!current) return;

    gameElement.style.visibility = "hidden";
    gameElement.width = 0;
    gameElement.height = 0;
    requestAnimationFrame(() => {
      const size = { width: current.offsetWidth - 1, height: current.offsetHeight - 1 };
      gameElement.width = size.width;
      gameElement.height = size.height;
      gameElement.style.visibility = "visible";
      if (state.gameRenderer) state.gameRenderer.renderer.resize(size.width, size.height);
      setSize(size);
    });
  };

  useEffect(() => {
    // forcibly coerce a known only `undefined` to `typeof current`
    /** @type {any} */
    const expr = divRef.current;
    /** @type {HTMLDivElement | undefined} */
    const current = expr;
    if (!current) return;

    current.appendChild(gameElement);

    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    // when we're loading the world, the block bar isn't loaded
    // once the game loads, then the block bar loads, and it takes
    // up some space. once it takes up space, the screen overflows
    // because the game is set at a fixed height
    //
    // https://stackoverflow.com/questions/14866775/detect-document-height-change
    // here we detect any changes in height, and then re-set our height
    let heightOld = document.body.scrollHeight;
    loopRequestAnimationFrame(() => {
      if (!state.connection?.connected) return "halt";
      let heightNow = document.body.scrollHeight;

      if (heightOld != heightNow) {
        updateSize();
        heightOld = heightNow;
      }
    });
  }, []);

  // freaking lol
  useEffect(async () => {
    await state.wait;
    requestAnimationFrame(() => updateSize());
  }, []);

  return (
    <EntireDiv ref={divRef}>
      <ConnectToGame gameElement={gameElement} size={size} />
    </EntireDiv>
  );
}
