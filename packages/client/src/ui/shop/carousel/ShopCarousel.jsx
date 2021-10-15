//@ts-check
import React, { useState } from "react";

import { Button, Grid, Slide } from "@mui/material";

import ShopItem from "../ShopItem";
import ShopItemSkeleton from "../ShopItemSkeleton";
import Carousel from "../../components/Carousel";

export default function ShopCarousel({ items }) {
  if (!Array.isArray(items)) {
    return items;
  }

  return (
    <Carousel visibleItems={3}>
      {items.map((item) => (
        <ShopItem {...item} key={item.id} />
      ))}
    </Carousel>
  );
}
