//@ts-check
import React from "react";
import { Navigate } from "react-router";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import { Grid, Typography, Container, styled } from "@mui/material";
import { useToken } from "../hooks";
import ScrollingBackground from "@/brand/ScrollingBackground";
import TitleScreen from "@/brand/TitleScreen";

interface BigLinkProps {
  to: string;
  children: React.ReactChild;
}
const BigLink = ({ to, children }: BigLinkProps) => (
  <Link to={to}>
    <Typography variant="h3">{children}</Typography>
  </Link>
);

const HomePage = () => {
  const [token] = useToken();

  // if they have a token, they should go straight to the lobby
  if (token) {
    return <Navigate to="/lobby" />;
  }

  return (
    <ScrollingBackground>
      <TitleScreen title="smiley face game">
        <BigLink to="/guest">play as guest</BigLink>
        <BigLink to="/login">login</BigLink>
        <BigLink to="/register">register</BigLink>
        <Link to="/terms">legal</Link>
      </TitleScreen>
    </ScrollingBackground>
  );
};

export default HomePage;
