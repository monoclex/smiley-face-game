import React from "react";

import { Grid, Paper, Typography, styled } from "@mui/material";

import { Category, CategoryType } from "@smiley-face-game/api/enums";

import ShopCarousel from "./carousel/ShopCarousel";

const CarouselContainer = styled("div")({
  padding: 10,
});

export default () => {
  // TODO:
  //  Fetch featured items

  const items = [
    {
      id: 7,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured | CategoryType.Owned,
      cost: 420,
    },
    {
      id: 8,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 421,
    },
    {
      id: 9,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 422,
    },
    {
      id: 10,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured | CategoryType.Owned,
      cost: 423,
    },
    {
      id: 11,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 424,
    },
    {
      id: 12,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 425,
    },
    {
      id: 14,
      size: 3,
      title: "big",
      description: "asd",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 425,
    },
  ];

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
