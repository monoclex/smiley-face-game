import React from "react";
import { ExitToApp } from "mdi-material-ui";
import { styled } from "@mui/material";

const RotatedExitToApp = styled(ExitToApp)({
  // https://github.com/Dogfalo/materialize/issues/3732#issuecomment-251741094
  transform: "rotate(180deg)",
});

export default function LogoutIcon() {
  return <RotatedExitToApp />;
}
