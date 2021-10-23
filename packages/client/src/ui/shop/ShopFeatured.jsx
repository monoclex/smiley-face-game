import React from "react";

import { Grid, Typography } from "@mui/material";

import { CategoryType } from "@smiley-face-game/api/enums";
import { useShopItems } from "../hooks";
import { ShopFeaturedItem } from "./ShopFeaturedItem";
import Carousel from "../components/Carousel";

const ShopFeatured = () => {
  const shopItems = useShopItems();

  const items = shopItems.filter((item) => (item.categoryType & CategoryType.Featured) != 0);

  return (
    <Grid container direction="column" justifyContent="center">
      <Grid item>
        <Grid container>
          <Typography variant="h5">Featured items</Typography>
        </Grid>
      </Grid>

      <div sx={{ padding: 8 }}>
        <Carousel visibleItems={1}>
          {items.map((x, idx) => (
            <ShopFeaturedItem key={idx} {...x} />
          ))}
        </Carousel>
      </div>
    </Grid>
  );
};

export default ShopFeatured;
