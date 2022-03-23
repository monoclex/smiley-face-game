import { Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import styles from "./titleScreen.scss";

interface TitleScreenProps {
  title: string;
  children: React.ReactChild[];
}

// TODO(clean): i kinda got lazy while doing this, there's probably some unnecesary
// stuff that coudl be cleaned up here

export default function TitleScreen({ title, children }: TitleScreenProps) {
  // splitting into words becuz we want flex to wrap text
  // usually text is wrapped but we want every lteter to individually jump
  const titleWords = title.split(" ");

  const stucks: Unstuck[] = [];
  const onStuck = (stuck: Unstuck) => {
    stucks.push(stuck);

    if (stucks.length === titleWords.map((word) => word.length).reduce((a, b) => a + b)) {
      // TODO: for a reward we should have a smiley roll across the screen lol
      setTimeout(() => {
        let i = 0;
        for (const stuck of stucks.splice(0, stucks.length)) {
          setTimeout(stuck, 200 * i);
          i++;
        }
      }, 1000);
    }
  };

  const titleWordLetters = titleWords.map((word) =>
    word.split("").map((letter, index) => (
      <JumpingLetter key={index} onStuck={onStuck}>
        <Typography className={styles.titleLetter} variant="h1">
          {letter}
        </Typography>
      </JumpingLetter>
    ))
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {titleWordLetters.map((word, index) => (
          <div className={styles.word} key={index}>
            {word}
          </div>
        ))}
      </div>
      <div className={styles.choices}>
        {React.Children.map(children, (child) => (
          <div className={styles.choice}>{child}</div>
        ))}
      </div>
    </div>
  );
}

// doing this in CSS is too hard

interface JumpingLetterProps {
  children: React.ReactChild;
  onStuck: (unsticker: Unstuck) => void;
}

type Unstuck = () => void;

function JumpingLetter({ children, onStuck }: JumpingLetterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let isHovering = false;
    let willBeUp = false;
    let lastTransitionEvent = Date.now();
    let gotStuck = false;

    const fallDown = () => {
      node.style.transition = "transform 0.2s cubic-bezier(.26,.98,.27,.98)";
      node.style.transform = "translateY(0)";
      willBeUp = false;
    };

    // there's a bug where the letters get stuck and i'm not exactly sure why lol
    // so i made it seem intentional :p
    const checkIfStuck = () => {
      if (gotStuck) return;
      if (!willBeUp) return;

      const delta = Date.now() - lastTransitionEvent;
      if (delta <= 800) return;

      node.style.color = "lime";
      gotStuck = true;

      onStuck(() => {
        node.style.color = "";
        fallDown();
        gotStuck = false;
      });
    };

    const jumpUp = () => {
      node.style.transition = "transform 0.2s cubic-bezier(.48,1.58,.7,1.47)";
      node.style.transform = "translateY(-2em)";
      willBeUp = true;
      setTimeout(checkIfStuck, 900);
    };

    const hover = () => {
      if (!willBeUp) {
        jumpUp();
      }
      isHovering = true;
    };

    const unhover = () => {
      isHovering = false;
    };

    const transitionEnd = () => {
      lastTransitionEvent = Date.now();
      if (willBeUp) {
        fallDown();
      } else if (isHovering) {
        jumpUp();
      } else {
        fallDown();
      }
    };

    node.addEventListener("mouseover", hover);
    node.addEventListener("mouseleave", unhover);
    node.addEventListener("transitionend", transitionEnd);

    return () => {
      node.removeEventListener("mouseover", hover);
      node.removeEventListener("mouseleave", unhover);
      node.removeEventListener("transitionend", transitionEnd);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
