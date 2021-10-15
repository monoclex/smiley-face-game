import React, { useState } from "react";

import { Button, Grid, Slide } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

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
