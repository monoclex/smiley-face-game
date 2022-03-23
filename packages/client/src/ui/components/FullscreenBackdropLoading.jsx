import React from "react";
import { CircularProgress, Typography, styled } from "@mui/material";
import Loading from "@/brand/Loading";

const Centered = styled("div")({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
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
    <Centered>
      <Loading />
    </Centered>
  );
}
