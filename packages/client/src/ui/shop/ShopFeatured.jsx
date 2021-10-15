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
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured | CategoryType.Owned,
      cost: 420,
    },
    {
      id: 8,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 421,
    },
    {
      id: 9,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 422,
    },
    {
      id: 10,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured | CategoryType.Owned,
      cost: 423,
    },
    {
      id: 11,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 424,
    },
    {
      id: 12,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Featured,
      cost: 425,
    },
  ];

  return (
    <Grid container direction="column" justifyContent="center">
      <Grid item>
        <Paper square>
          <Grid container justifyContent="center">
            <Typography variant="h5">idk what title here</Typography>
          </Grid>
        </Paper>
      </Grid>
      <CarouselContainer>
        <ShopCarousel items={items} />
      </CarouselContainer>
    </Grid>
  );
};
