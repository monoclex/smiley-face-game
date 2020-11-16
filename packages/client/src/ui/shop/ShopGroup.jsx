import React from "react";

import { Grid } from "@material-ui/core";

import ShopItem from "./ShopItem";

export default ({ items, category }) => {
  const filteredItems = category ? items.filter((item) => item.category === category) : items;

  return (
    <Grid container spacing={3}>
      {filteredItems.map((item) => {
        return (
          <Grid item key={item.id}>
            <ShopItem {...item} />
          </Grid>
        );
      })}
    </Grid>
  );
};
