import React from "react";
import { useNavigate } from "react-router";

// super lazy 'not found' thing
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <h1>Not Found</h1>
      <p>The page you were looking for was not found.</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </>
  );
}
