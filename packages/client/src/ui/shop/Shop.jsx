//@ts-check
import React, { useState } from "react";

import { styled, Box, Grid, Paper, Tab, Toolbar, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Earth as WorldIcon, EmoticonTongueOutline as SmileyIcon } from "mdi-material-ui";

import { Category, CategoryType } from "@smiley-face-game/api/enums";

import ShopCarousel from "./carousel/ShopCarousel";
import ShopGroup from "./ShopGroup";
import ShopItem from "./ShopItem";
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
  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Grab shop content from API
  //  Send request to API when buying an item

  const items = [
    {
      id: 1,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.Owned,
      cost: 420,
    },
    {
      id: 2,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.None,
      cost: 421,
    },
    {
      id: 3,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.None,
      cost: 422,
    },
    {
      id: 4,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.Character,
      categoryType: CategoryType.Owned,
      cost: 423,
    },
    {
      id: 5,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 424,
    },
    {
      id: 6,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 425,
    },
    {
      id: 13,
      title: "This new item is so good...",
      description: "You should totally buy it!",
      image: "",
      category: Category.World,
      categoryType: CategoryType.None,
      cost: 425,
    },
  ];

  const [value, setValue] = useState("1");

  return (
    <Grid container>
      <Grid item container justifyContent="center">
        <Grid item>
          <SpacedPaper>
            <ShopFeatured />
          </SpacedPaper>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <SpacedPaper>
          <TabContext value={value}>
            <Paper square>
              <TabList onChange={(e, newValue) => setValue(newValue)} centered>
                <Tab label={<Icon icon={WorldIcon} text="Worlds" />} value="1" />
                <Tab label={<Icon icon={SmileyIcon} text="Smilies" />} value="2" />
                <Tab label="Owned" value="3" />
              </TabList>
            </Paper>

            <TabPanel value="1">
              <ShopGroup items={items} category={Category.World} />
            </TabPanel>
            <TabPanel value="2">
              <ShopGroup items={items} category={Category.Character} />
            </TabPanel>
            <TabPanel value="3">
              <ShopGroup items={items.filter((item) => (item.categoryType & CategoryType.Owned) !== 0)} />
            </TabPanel>
          </TabContext>
        </SpacedPaper>
      </Grid>
    </Grid>
  );
};

export default Shop;
