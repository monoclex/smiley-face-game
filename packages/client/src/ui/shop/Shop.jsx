import React, { useState } from "react";

import { AppBar, Box, Grid, makeStyles, Paper, Tab, Toolbar, Typography } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Earth as WorldIcon, EmoticonTongueOutline as SmileyIcon } from "mdi-material-ui";

import ShopCarousel from "./carousel/ShopCarousel";
import ShopGroup from "./ShopGroup";
import ShopItem from "./ShopItem";

const useStyles = makeStyles({
  // this paper class should probably be removed when everything's done
  // the parent should decide how much margin etc
  paper: {
    margin: 20,
    marginBottom: 0,
  },
  carousel: {
    padding: 10,
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
  //  Make selected tab more obvious
  //  Give featured items a title bar
  //  Make the shop carousel actually work
  //  Grab shop content from API
  //  Send request to API when buying an item

  const items = [
    {
      id: 1,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "world",
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
      owned: true,
      cost: 422,
    },
    {
      id: 4,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "featured",
      cost: 423,
    },
    {
      id: 5,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "featured",
      cost: 424,
    },
    {
      id: 6,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: "featured",
      cost: 425,
    },
  ];

  const [value, setValue] = useState("1");

  return (
    <Grid container>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <div className={classes.carousel}>
            featured items...
            <ShopCarousel items={items.filter((item) => item.category === "featured")} />
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <TabContext value={value}>
            <AppBar position="static">
              <TabList onChange={(e, newValue) => setValue(newValue)} centered>
                <Tab label={<Icon icon={WorldIcon} text="Worlds" />} value="1" />
                <Tab label={<Icon icon={SmileyIcon} text="Smilies" />} value="2" />
                <Tab label="Owned" value="3" />
              </TabList>
            </AppBar>

            <TabPanel value="1">
              <ShopGroup items={items} category="world" />
            </TabPanel>
            <TabPanel value="2">
              <ShopGroup items={items} category="smiley" />
            </TabPanel>
            <TabPanel value="3">
              <ShopGroup items={items.filter((x) => x.owned)} />
            </TabPanel>
          </TabContext>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Shop;
