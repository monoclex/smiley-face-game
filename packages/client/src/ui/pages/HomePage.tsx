//@ts-check
import React from "react";
import { Navigate } from "react-router";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Grid, Typography, Container, styled } from "@mui/material";
import { useToken } from "../hooks";
import ScrollingBackground from "@/brand/ScrollingBackground";
import TitleScreen from "@/brand/TitleScreen";
import LinkTo from "@/brand/LinkTo";

interface BigLinkProps {
  to: string;
  children: React.ReactChild;
}
const BigLink = ({ to, children }: BigLinkProps) => (
  <LinkTo to={to}>
    <Typography variant="h3">{children}</Typography>
  </LinkTo>
);

const HomePage = () => {
  const [token] = useToken();

  // if they have a token, they should go straight to the lobby
  if (token) {
    return <Navigate to="/lobby" />;
  }

  return (
    <TitleScreen title="smiley face game">
      <BigLink to="/guest">play as guest</BigLink>
      <BigLink to="/login">login</BigLink>
      <BigLink to="/register">register</BigLink>
      <Link to="/terms">legal</Link>
    </TitleScreen>
  );
};

export default HomePage;
