import React from "react";
import styles from "./scrollingBackground.scss";
import backgroundUrl from "@/assets/background/background.png";

interface ScrollingBackgroundProps {
  children: React.ReactNode;
}

const scssBackgroundUrlDoesntWorkWee = { backgroundImage: `url(${backgroundUrl})` };

export default function ScrollingBackground({ children }: ScrollingBackgroundProps) {
  return (
    <div className={styles.backgroundScrollAnimation} style={scssBackgroundUrlDoesntWorkWee}>
      {children}
    </div>
  );
}
