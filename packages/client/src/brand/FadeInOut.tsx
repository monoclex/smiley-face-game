/* eslint-disable no-undef */ // eslint cant find HTMLElementEventMap lol
import { useBeforeNavigateTo } from "@/hooks";
import PromiseCompletionSource from "@/PromiseCompletionSource";
import React, { useRef, useState } from "react";
import styles from "./fadeInOut.scss";

interface FadeInOutProps {
  children: React.ReactNode;
  dontFadeBackIn?: boolean;
}

export const promisfyEvent = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  options?: boolean | AddEventListenerOptions
): Promise<HTMLElementEventMap[K]> => {
  const completionSource = new PromiseCompletionSource<HTMLElementEventMap[K]>();

  const handler = (event: HTMLElementEventMap[K]) => {
    element.removeEventListener(type, handler, options);
    completionSource.resolve(event);
  };

  element.addEventListener(type, handler, options);
  return completionSource.handle;
};

export default function FadeInOut({ children, dontFadeBackIn }: FadeInOutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState(styles.fadeIn);

  useBeforeNavigateTo(async () => {
    const node = ref.current;
    if (!node) return;

    const onFadeOut = promisfyEvent(node, "animationend");
    setStyle(styles.fadeOut);
    await onFadeOut;
    if (!dontFadeBackIn) setStyle(styles.fadeIn);
  }, []);

  return (
    <div ref={ref} className={style}>
      {children}
    </div>
  );
}
