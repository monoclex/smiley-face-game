import React from "react";

import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";

import { Category, CategoryType } from "@smiley-face-game/api/enums";

import ShopCarousel from "./carousel/ShopCarousel";

const useStyles = makeStyles({
  carousel: {
    padding: 10,
  },
});

export default () => {
  const classes = useStyles();

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
    <Grid container direction="column" justify="center">
      <Grid item>
        <Paper square>
          <Grid container justify="center">
            <Typography variant="h5">idk what title here</Typography>
          </Grid>
        </Paper>
      </Grid>
      <div className={classes.carousel}>
        <ShopCarousel items={items} />
      </div>
    </Grid>
  );
};
