import React from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";

export default function FullscreenBackdropLoading({ message = "Loading..." }) {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
      <Typography variant="h1">{message}</Typography>
      <CircularProgress size={64} color="inherit" />
    </Backdrop>
  );
}
