import React from "react";

import { Grid, makeStyles } from "@material-ui/core";

import ShopItem from "../ShopItem";

const useStyles = makeStyles({
  //
});

export default ({ items }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item key={item.id}>
          <ShopItem {...item} />
        </Grid>
      ))}
    </Grid>
  );
};
