//@ts-check
import React, { useEffect } from "react";

import { useNavigate, useMatch } from "react-router";
import ErrorBoundary from "../components/ErrorBoundary";
import GameUI from "../game/GameUI";

export default function PlayPage() {
  return (
    <ErrorBoundary render={FriendlyErrorMessage}>
      <GameUI />
    </ErrorBoundary>
  );
}

function FriendlyErrorMessage({ error, callback }) {
  const navigate = useNavigate();
  const match = useMatch("/games/:id");

  useEffect(
    () =>
      navigate("/lobby", {
        state: {
          error,
          name: error.name,
          id: match?.params.id,
        },
      }),
    []
  );

  return null;
}
