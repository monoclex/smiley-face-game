//@ts-check
import React from "react";

import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { Button, Card, CardActions, CardContent, CardMedia, Typography, styled } from "@mui/material";

const ShopCard = styled(Card)({
  width: 256,
  height: 384,
});

const BuyButton = styled(Button)({
  marginLeft: "auto !important",
});

export default function ShopItem({ image, title, description, owned, cost }) {
  const snackbar = useSnackbar();

  const handleClick = () => {
    // TODO: send buy request
    snackbar.enqueueSnackbar(`Item bought for ${cost} monies!`, {
      variant: "success",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };

  const PriceLabel = () => {
    if (owned) {
      return <strike>Price: {cost}</strike>;
    }

    return <span>Price: {cost}</span>;
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <ShopCard>
        <CardMedia component="img" image={image} title={title} width={256} height={196} />

        <CardContent>
          <Typography gutterBottom variant="h6" component="h6">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
        </CardContent>

        <CardActions>
          <PriceLabel />

          <BuyButton size="small" color="primary" variant="contained" disabled={owned} onClick={handleClick}>
            {owned ? "owned" : "buy"}
          </BuyButton>
        </CardActions>
      </ShopCard>
    </motion.div>
  );
}
