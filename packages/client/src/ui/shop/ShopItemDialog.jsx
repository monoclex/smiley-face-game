import React, { useState } from "react";

import { useSnackbar } from "notistack";
import { Typography, Grid, Slider, IconButton, Tooltip, Button } from "@mui/material";

import { BasicDialog } from "../components/BasicDialog";
import EnergyIcon from "../icons/EnergyIcon";
import { useAuth } from "../hooks";

// TODO not hardcode height, i think
/** @param {{ open: boolean, onClose: () => void, item: import("@smiley-face-game/api/types").ZShopItem }} props */
export const ShopItemDialog = ({ open, onClose, item }) => {
  const [spendingEnergy, setSpendingEnergy] = useState(30);
  const snackbar = useSnackbar();
  const auth = useAuth();

  const { id, title, description, image, energyCost } = item;

  const handleClick = () => {
    // TODO: loading animation
    auth
      .buy({
        id,
        spendEnergy: spendingEnergy,
      })
      .then((response) => {
        // TODO: update information about the player with `response`
        console.log(response);

        // TODO make nice little animation for adding energy instead of unhealthy snacks
        snackbar.enqueueSnackbar(`Added ${spendingEnergy} energy!`, {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      })
      .catch((error) => {
        console.error(error);
        snackbar.enqueueSnackbar(`Error spending energy: ${error}`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
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
          </Grid>
        </Grid>
      }
      actions={
        <Grid container spacing={3}>
          <Grid item sx={1} />

          {/* TODO fix sx flexgrow1 here, slider should have some sort of width based on space left */}
          <Grid item sx={{ flexGrow: 1 }}>
            <Slider
              marks
              valueLabelDisplay="auto"
              defaultValue={30}
              step={10}
              min={10}
              max={energyCost}
              value={spendingEnergy}
              onChange={(_, value) => setSpendingEnergy(value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" endIcon={<EnergyIcon />} onClick={handleClick}>
              Energize
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
};
