import React from "react";

import { Grid, Typography } from "@material-ui/core";

import ShopItem from "./ShopItem";
import ShopItemSkeleton from "./ShopItemSkeleton";

export default ({ items, category }) => {
  const filteredItems = category ? items.filter((item) => item.category === category) : items;

  if (filteredItems.length === 0)
    return (
      <Grid container justify="center">
        <Typography variant="h5">Nothing to be found here :o</Typography>
      </Grid>
    );

  return (
    <Grid container spacing={3} justify="center">
      {filteredItems.map((item) => (
        <Grid item>
          <ShopItem {...item} key={item.id} />
        </Grid>
      ))}
    </Grid>
  );
};
