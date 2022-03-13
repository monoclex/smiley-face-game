import { useEffect } from "react";

export default function useKeyboard(key: string, onKeyDown: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === key) onKeyDown();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [key, onKeyDown]);
}
