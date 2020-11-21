import React, { useState } from "react";

import { Box, Grid, makeStyles, Paper, Tab, Toolbar, Typography } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Earth as WorldIcon, EmoticonTongueOutline as SmileyIcon } from "mdi-material-ui";

import ShopCarousel from "./carousel/ShopCarousel";
import ShopGroup from "./ShopGroup";
import ShopItem from "./ShopItem";
import ShopFeatured from "./ShopFeatured";

const useStyles = makeStyles({
  paper: {
    margin: 20,
    marginBottom: 0,
  },
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
  const classes = useStyles();

  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Make the tab panels also generic? (loaded from api)
  //  Grab shop content from API
  //  Send request to API when buying an item

  const items = [
    {
      id: 1,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "smiley",
      cost: 420,
    },
    {
      id: 2,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "world",
      cost: 421,
    },
    {
      id: 3,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "smiley",
      cost: 422,
    },
    {
      id: 4,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "smiley",
      cost: 423,
    },
    {
      id: 5,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "world",
      cost: 424,
    },
    {
      id: 6,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "world",
      cost: 425,
    },
    {
      id: 13,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "world",
      cost: 425,
    },
  ];

  const [value, setValue] = useState("1");

  return (
    <Grid container>
      <Grid item container justify="center">
        <Grid item>
          <Paper className={classes.paper}>
            <ShopFeatured />
          </Paper>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <TabContext value={value}>
            <Paper square>
              <TabList onChange={(e, newValue) => setValue(newValue)} centered>
                <Tab label={<Icon icon={WorldIcon} text="Worlds" />} value="1" />
                <Tab label={<Icon icon={SmileyIcon} text="Smilies" />} value="2" />
                <Tab label="Owned" value="3" />
              </TabList>
            </Paper>

            <TabPanel value="1">
              <ShopGroup items={items} category="world" />
            </TabPanel>
            <TabPanel value="2">
              <ShopGroup items={items} category="smiley" />
            </TabPanel>
            <TabPanel value="3">
              <ShopGroup items={items} category="owned" />
            </TabPanel>
          </TabContext>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Shop;
