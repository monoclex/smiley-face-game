//@ts-check
import React, { useState, useEffect } from "react";
import { styled } from "@mui/material";
import { BlockInfo } from "@smiley-face-game/api/tiles/register";

interface ImageProps {
  src: string;
}

const BlockPreview = styled("img")<ImageProps>(({ src }) => ({
  width: 32,
  height: 32,
  pointerEvents: "all",
  imageRendering: "pixelated",
  backgroundImage: src,
}));

interface BlockProps {
  block: BlockInfo;
  loader: (id: number) => Promise<HTMLImageElement>;
}

const Block = ({ block, loader }: BlockProps) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loader) return;
    loader(block.id).then(({ src }) => setUrl(src));
  }, [loader, block]);

  if (!url) {
    return null;
  }

  return <BlockPreview src={url} draggable={false} />;
};

export default React.memo(Block);
