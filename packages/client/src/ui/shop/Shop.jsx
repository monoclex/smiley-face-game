//@ts-check
import React, { useState } from "react";
import { styled, Box, Grid, Paper, Tab } from "@mui/material";
import { useAuth } from "../hooks";
import { Category, CategoryType } from "@smiley-face-game/api/enums";
import ShopGroup from "./ShopGroup";
import ShopFeatured from "./ShopFeatured";

const SpacedPaper = styled(Paper)({
  margin: 20,
  marginBottom: 0,
});

const Icon = ({ icon: TextIcon, text }) => {
  return (
    <Box alignItems="center" display="flex">
      <TextIcon style={{ marginRight: 5 }} />
      {text}
    </Box>
  );
};

const Shop = () => {
  const auth = useAuth();

  if (auth.isGuest) console.error("rendering shop but its a guest!!!!!!!! oh noes");
  console.log(auth.id);

  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Grab shop content from API
  //  Send request to API when buying an item

  const items = [
    {
      id: 1,
      size: 1,
      title: "Castle Package",
      description: "Keeping the enemies out since the medieval times!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Owned,
      cost: 420,
    },
    {
      id: 2,
      size: 2,
      title: "",
      description: "asdfasdf",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.None,
      cost: 421,
    },
    {
      id: 3,
      size: 1,
      title: "",
      description: "",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.None,
      cost: 422,
    },
    {
      id: 4,
      size: 1,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      description: "",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.Owned,
      cost: 423,
    },
    {
      id: 5,
      size: 1,
      title: "Great Saved World",
      description: "Worlds do not get much larger than this enormous 400x200 saved world!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 424,
    },
    {
      id: 6,
      size: 1,
      title: "Large Saved World",
      description: "The 100x100 large world for those who really want to be creative.",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 425,
    },
    {
      id: 13,
      size: 1,
      title: "Massive Saved World",
      description: "Want some more beta sized worlds? Then buy this!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 425,
    },
  ];

  return (
    <Grid container>
      <Grid item container justifyContent="center">
        <Grid item>
          <ShopFeatured />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <ShopGroup items={items} />
      </Grid>
    </Grid>
  );
};

export default Shop;
