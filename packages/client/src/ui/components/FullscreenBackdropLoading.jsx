import React from "react";

import { Backdrop, CircularProgress } from "@mui/material";

export default function FullscreenBackdropLoading() {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
      <CircularProgress size={64} color="inherit" />
    </Backdrop>
  );
}
