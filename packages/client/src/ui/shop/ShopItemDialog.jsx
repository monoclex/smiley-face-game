import React, { useState } from "react";

import { useSnackbar } from "notistack";
import { Button, Typography, Grid, Slider } from "@mui/material";

import { BasicDialog } from "../components/BasicDialog";

// TODO not hardcode height, i think
export const ShopItemDialog = ({ open, onClose, item }) => {
  const [val, setVal] = useState(30);
  const snackbar = useSnackbar();

  const { title, description, image, cost } = item;

  const handleClick = () => {
    // TODO send buy request
    // TODO make nice little animation for adding energy instead of unhealthy snacks
    snackbar.enqueueSnackbar(`Added ${val} energy!`, {
      variant: "success",
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  };

  return (
    <BasicDialog
      open={open}
      onClose={onClose}
      title={title}
      content={
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <img title={title} width="100%" src={image} />
          </Grid>

          <Grid container direction="column" justifyContent="space-between" item xs>
            <Grid item>
              <Typography variant="body1">{description}</Typography>
            </Grid>

            <Grid container item>
              {/* TODO fix sx flexgrow1 here, slider should have some sort of width based on space left */}
              <Grid item sx={{ flexGrow: 1 }}>
                <Slider
                  marks
                  valueLabelDisplay="auto"
                  defaultValue={30}
                  step={10}
                  min={1}
                  max={cost}
                  value={val}
                  onChange={(event) => {
                    console.log("event ", event);

                    setVal(event.target.value);
                  }}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={handleClick}>
                  Add energy
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      }
    />
  );
};
