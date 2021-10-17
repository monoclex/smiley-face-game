import React from "react";

import { Grid, Paper, Typography, styled } from "@mui/material";

import { Category, CategoryType } from "@smiley-face-game/api/enums";
import { useShopItems } from "../hooks";
import ShopCarousel from "./carousel/ShopCarousel";

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
      <CarouselContainer>
        <ShopCarousel items={items} />
      </CarouselContainer>
    </Grid>
  );
};

export default ShopFeatured;
