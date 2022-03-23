import React from "react";
import styles from "./loading.scss";
import wat from "@/assets/mmmnop.png";

const ensureTransparentBeforeStylesHaveLoaded = { opacity: 1 };

export default function Loading() {
  return (
    <div className={styles.loading} style={ensureTransparentBeforeStylesHaveLoaded}>
      <div className={styles.jumpingText}>
        {"loading...".split("").map((letter, index) => (
          <div key={index} className={styles.jumpingTextLetter}>
            <div className={styles.rainbowText}>{letter}</div>
          </div>
        ))}
      </div>
      <img className={styles.rollingSmiley} src={wat}></img>
    </div>
  );
}
