import React, { useState } from "react";

import { Button, Grid, makeStyles, Slide } from "@material-ui/core";

import ShopItem from "../ShopItem";
import ShopItemSkeleton from "../ShopItemSkeleton";
import Carousel from "../../components/Carousel";

export default ({ items }) => {
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
};
