//@ts-check
import React, { useEffect, useState } from "react";

import { useSnackbar } from "notistack";
import { styled, LinearProgress, Typography, Grid, Slider, Button } from "@mui/material";

import { BasicDialog } from "../components/BasicDialog";
import EnergyIcon from "../icons/EnergyIcon";
import { useAuth, useShopItem, useRefresher, useEnergy } from "../hooks";
import { useRecoilState } from "recoil";
import { shopItemQuery, playerInfoSelector } from "../../state";
import { mapImageUrl } from "../../assets/shop/mapImageUrl";

const PaddedDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));

// TODO not hardcode height, i think
/** @param {{ id: number, open: boolean, onClose: () => void }} props */
export const ShopItemDialog = ({ id, open, onClose }) => {
  const [{ title, description, energySpent, energyCost }] = useShopItem(id);
  const image = mapImageUrl(id);

  const [playerInfo, setPlayerInfo] = useRecoilState(playerInfoSelector);
  const [_, setShopItem] = useRecoilState(shopItemQuery(id));

  const { energy } = useEnergy();

  const min = 0;
  const max = energy;
  const step = 5;

  const [spendingEnergy, setSpendingEnergy] = useState(energy);
  const snackbar = useSnackbar();
  const auth = useAuth();
  const refresher = useRefresher();

  useEffect(() => {
    if (spendingEnergy > max) {
      setSpendingEnergy(max);
    }
  }, [spendingEnergy, max, setSpendingEnergy]);

  const handleClick = () => {
    // TODO: loading animation
    // TODO: **IMPORTANT** update `useShopItems()` on setting shop item
    auth
      .buy({
        id,
        spendEnergy: spendingEnergy,
      })
      .then((response) => {
        refresher();
        setShopItem(response.item);
        setPlayerInfo({ ...playerInfo, energy: response.playerEnergy });

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
            <Grid item>
              <PaddedDiv>
                <Grid container direction="row" wrap="nowrap">
                  <div style={{ width: "100%" }}>
                    <LinearProgress
                      variant="determinate"
                      style={{ height: 15 }}
                      value={(energySpent / energyCost) * 100}
                    />
                  </div>
                  <div
                    style={{
                      paddingLeft: "1em",
                      display: "flex",
                      alignItems: "center",
                      wrap: "nowrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {energySpent}/{energyCost}
                    <EnergyIcon style={{ paddingLeft: "0.25em" }} />
                  </div>
                </Grid>
              </PaddedDiv>
            </Grid>
          </Grid>
        </Grid>
      }
      actions={
        <Grid container spacing={3}>
          <Grid item xs={1} />

          {/* TODO fix sx flexgrow1 here, slider should have some sort of width based on space left */}
          <Grid item sx={{ flexGrow: 1 }}>
            <Slider
              marks
              valueLabelDisplay="auto"
              step={step}
              min={min}
              max={max}
              value={spendingEnergy}
              onChange={(_, value) => {
                if (Array.isArray(value)) throw new Error("should not be getting multiple values");
                setSpendingEnergy(value);
              }}
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
