import React from "react";
import styles from "./scrollingBackground.scss";
import backgroundUrl from "@/assets/background/background.png";
import clsx from "clsx";
import { Theme, TypographyVariant, useMediaQuery, useTheme } from "@mui/material";

interface ScrollingBackgroundProps {
  children: React.ReactNode;
  shrink?: boolean;
  grow?: boolean;
  hide?: boolean;
}

const scssBackgroundUrlDoesntWorkWee = { backgroundImage: `url(${backgroundUrl})` };

const getResponsiveFontSizesForSX = (theme: Theme, variant: TypographyVariant) => {
  const style = theme.typography[variant];
  let chosenFontSize = style.fontSize;

  for (const mediaQuery of Object.keys(style).filter((key) => key.startsWith("@media"))) {
    const shouldUseMediaQuery = useMediaQuery(mediaQuery);

    if (shouldUseMediaQuery) {
      chosenFontSize = style[mediaQuery].fontSize;
    }
  }

  return chosenFontSize;
};

export default React.forwardRef<HTMLDivElement, ScrollingBackgroundProps>(
  function ScrollingBackground({ children, shrink, grow, hide }, ref) {
    const theme = useTheme();
    const fontSize = getResponsiveFontSizesForSX(theme, "h2");

    if (hide) return null;

    return (
      <div
        ref={ref}
        className={clsx(
          styles.backgroundScrollAnimation,
          shrink && styles.shrink,
          grow && styles.grow
        )}
        style={
          !shrink
            ? scssBackgroundUrlDoesntWorkWee
            : {
                ...scssBackgroundUrlDoesntWorkWee,
                fontSize,
              }
        }
      >
        {children}
      </div>
    );
  }
);
