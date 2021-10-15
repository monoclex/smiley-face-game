import React from "react";

import { motion } from "framer-motion";

import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';

const useStyles = makeStyles({
  root: {
    width: 256,
    height: 384,
  },
});

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const RandomSkeletonWidth = ({ min, max }) => {
  return <Skeleton animation="pulse" height={15} width={random(min, max)} style={{ marginRight: 3 }} />;
};

export default () => {
  const classes = useStyles();

  const items = new Array(20).fill(0);
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Card className={classes.root}>
        <Skeleton animation="wave" variant="rectangular" width={256} height={196} />

        <CardContent>
          <Skeleton animation="pulse" height={30} style={{ marginBottom: 12 }} />

          <Grid container direction="row">
            {items.map((x, index) => (
              <RandomSkeletonWidth min={15} max={60} key={index} />
            ))}
          </Grid>
        </CardContent>

        <CardActions>
          <Skeleton animation="pulse" height={15} width="20%" />
        </CardActions>
      </Card>
    </motion.div>
  );
};
