import React from "react";

import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  root: {
    width: 256,
    height: 384,
  },
  buyButton: {
    marginLeft: "auto !important",
  },
});

export default ({ image, title, description, owned, cost }) => {
  const classes = useStyles();
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
      <Card className={classes.root}>
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

          <Button
            size="small"
            color="primary"
            variant="contained"
            className={classes.buyButton}
            disabled={owned}
            onClick={handleClick}
          >
            {owned ? "owned" : "buy"}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};
