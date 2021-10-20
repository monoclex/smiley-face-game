import React from "react";

import { Grid, Paper, Typography, styled } from "@mui/material";

import { Category, CategoryType } from "@smiley-face-game/api/enums";
import { useShopItems } from "../hooks";
import ShopCarousel from "./carousel/ShopCarousel";
import { ShopFeaturedItem } from "./ShopFeaturedItem";
import Carousel from "../components/Carousel";

const CarouselContainer = styled("div")({
  padding: 10,
});

const ShopFeatured = () => {
  const shopItems = useShopItems();

  if (shopItems === undefined) return <h1>laoding</h1>;
  if (shopItems instanceof Error) return <h1>error loading</h1>;

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
          {items.map((x) => (
            <ShopFeaturedItem key={x.id} {...x} />
          ))}
        </Carousel>
      </div>
    </Grid>
  );
};

export default ShopFeatured;
