import { useState } from "react";

/**
 * Returns a function that will force a rerender.
 */
export default function useRerender() {
  const [_, setState] = useState({});
  return () => setState({});
}
