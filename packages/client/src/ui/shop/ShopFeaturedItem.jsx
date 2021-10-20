import { Grid } from "@mui/material";
import React from "react";

export const ShopFeaturedItem = ({ title, description, energyCost, image }) => {
  image =
    image ||
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg1.ali213.net%2Fglpic%2F2020%2F12%2F18%2F584_2020121812704639.jpg&f=1&nofb=1";

  return (
    <Grid container>
      <Grid item>
        <img title={title} src={image} />
      </Grid>
    </Grid>
  );
};
