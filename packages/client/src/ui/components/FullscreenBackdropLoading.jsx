import React from "react";
import { Backdrop, CircularProgress, Typography, styled } from "@mui/material";

const Centered = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
});

export function BigLoading({ message = "Loading..." }) {
  return (
    <Centered>
      <Typography variant="h1">{message}</Typography>
      <CircularProgress size={64} color="inherit" />
    </Centered>
  );
}

export default function FullscreenBackdropLoading(props) {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
      <BigLoading {...props} />
    </Backdrop>
  );
}
