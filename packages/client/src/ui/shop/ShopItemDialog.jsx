import { useState } from "react";

import { useSnackbar } from "notistack";
import { styled, LinearProgress, Typography, Grid, Slider, Button } from "@mui/material";

import { BasicDialog } from "../components/BasicDialog";
import EnergyIcon from "../icons/EnergyIcon";
import { useAuth } from "../hooks";
import { useRecoilState } from "recoil";
import { shopItemQuery, playerInfoState } from "../../state";

const PaddedDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));

// TODO not hardcode height, i think
/** @param {{ open: boolean, onClose: () => void, item: import("@smiley-face-game/api/types").ZShopItem }} props */
export const ShopItemDialog = ({ open, onClose, item }) => {
  // TODO: choose the amount of energy based on:
  // - how much energy has already been spent
  // - how much energy is available
  // - some sort of reasonable step
  const { id, title, description, image, energySpent, energyCost } = item;

  const [playerInfo, setPlayerInfo] = useRecoilState(playerInfoState);
  const [_, setShopItem] = useRecoilState(shopItemQuery(id));

  const [spendingEnergy, setSpendingEnergy] = useState(Math.min(25, energyCost));
  const snackbar = useSnackbar();
  const auth = useAuth();

  const handleClick = () => {
    // TODO: loading animation
    // TODO: **IMPORTANT** update `useShopItems()` on setting shop item
    auth
      .buy({
        id,
        spendEnergy: spendingEnergy,
      })
      .then((response) => {
        // TODO: update information about the player with `response`
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
                    <LinearProgress variant="determinate" style={{ height: 15 }} value={(energySpent / energyCost) * 100} />
                  </div>
                  <div style={{ paddingLeft: "1em", display: "flex", alignItems: "center", wrap: "nowrap", justifyContent: "flex-end" }}>
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
              step={energyCost < 50 ? 1 : Math.round(energyCost / 50)}
              min={0}
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
