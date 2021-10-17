//@ts-check
import React, { useState } from "react";
import { styled, Box, Grid, Paper, Tab } from "@mui/material";
import { useAuth, useShopItems } from "../hooks";
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

  if (auth.isGuest) console.error("rendering shop but its a guest!!!!!!!! oh noes (this shouldn't happen because router should preventit)");
  console.log(auth.id);

  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Grab shop content from API (done, but not polished)
  //  Send request to API when buying an item (done, but not polished)

  const items = useShopItems();

  if (items === undefined) return <h1>loading</h1>;
  if (items instanceof Error) return <h1>error: {items.message}</h1>;

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
