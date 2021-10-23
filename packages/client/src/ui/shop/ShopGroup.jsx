import React from "react";
import { Grid, Typography } from "@mui/material";
import ShopItem from "./ShopItem";

export default function ShopGroup({ items, category = undefined }) {
  const filteredItems = category ? items.filter((item) => item.category === category) : items;

  if (filteredItems.length === 0)
    return (
      <Grid container justifyContent="center">
        <Typography variant="h5">Nothing to be found here :o</Typography>
      </Grid>
    );

  return (
    <Grid container spacing={3} justifyContent="center">
      {filteredItems.map((item) => (
        <Grid item key={item.id}>
          <ShopItem key={item.id} {...item} />
        </Grid>
      ))}
    </Grid>
  );
}
