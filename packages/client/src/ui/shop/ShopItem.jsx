import React, { useState } from "react";

import { motion } from "framer-motion";
import { Box, Card, CardContent, Typography, Chip, CardActionArea } from "@mui/material";

import EnergyIcon from "../icons/EnergyIcon";
import { ShopItemDialog } from "./ShopItemDialog";

export default function ShopItem({ image, size, title, description, cost }) {
  // these are obviously just for testing...
  description =
    description ||
    "You should totally buy it! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  title = title || "This new item is so good...";
  image = image || "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.wp.com%2Fpopcat.click%2Fog-card.jpg&f=1&nofb=1";
  // end testing

  const [isOpen, setIsOpen] = useState(false);

  const CardHeader = ({ title, width, height, src }) => {
    return (
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
        <Box sx={{ position: "absolute", padding: 1 }}>
          <Chip icon={<EnergyIcon />} label={<Box sx={{ color: "white", fontWeight: "bold" }}>{cost}</Box>} />
        </Box>

        <img title={title} width={width} height={height} src={src} />
      </Box>
    );
  };

  const width = 256 * size;
  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Card style={{ width }}>
          <CardActionArea onClick={() => setIsOpen(true)}>
            <CardHeader src={image} title={title} width={width} height={196} />

            <CardContent>
              <Typography gutterBottom>{title}</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {description}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </motion.div>

      <ShopItemDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        item={{
          title,
          description,
          cost,
          image,
        }}
      />
    </>
  );
}
