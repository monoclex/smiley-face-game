import React, { useState } from "react";

import { motion } from "framer-motion";
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CardActionArea,
  LinearProgress,
} from "@mui/material";

import EnergyIcon from "../icons/EnergyIcon";
import { ShopItemDialog } from "./ShopItemDialog";
import { styled } from "@mui/system";
import { CategoryType } from "@smiley-face-game/api/enums";
import { useShopItem } from "../hooks";
import { mapImageUrl } from "../../assets/shop/mapImageUrl";

const PaddedDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)({
  height: 384,
});

const ClampedTypography = styled(Typography)({
  WebkitBoxOrient: "vertical",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  overflow: "hidden",
});

/** @param {{ id: number, isVertical?: boolean }} props */
export default function ShopItem({ id, isVertical = false, columnSpan }) {
  // image = image || "https://media.discordapp.net/attachments/883149522862227507/883454824614625340/image0_4.gif";

  const [{ title, description, energySpent, energyCost, categoryType }] = useShopItem(id);
  const image = mapImageUrl(id);

  const [isOpen, setIsOpen] = useState(false);

  const CardHeader = ({ title, width, height, src, isVertical }) => {
    return (
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
        {(categoryType & CategoryType.Featured) != 0 ? (
          <Box sx={{ position: "absolute", padding: 1 }}>
            <Chip
              style={{ backgroundColor: "red" }}
              label={<Box sx={{ color: "white", fontWeight: "bold" }}>FEAT</Box>}
            />
          </Box>
        ) : null}

        <img title={title} width={width} height={height * (isVertical ? 2 : 1)} src={src} />
      </Box>
    );
  };

  const width = "100%";
  const minWidth = 0;
  return (
    <Box sx={{ minWidth, width }}>
      <motion.div whileHover={{ scale: 1.05 }}>
        <CardActionArea onClick={() => setIsOpen(true)}>
          <StyledCard
            style={{
              width,
              display: isVertical && "flex",
              justifyContent: "flex-start",
              flexDirection: "row",
            }}
          >
            <CardHeader
              src={image}
              title={title}
              width={width}
              height={196}
              isVertical={isVertical}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minWidth: "33%",
                minHeight: "50%",
              }}
            >
              <CardContent>
                <Typography gutterBottom noWrap>
                  {title}
                </Typography>
                <ClampedTypography variant="subtitle2" color="textSecondary">
                  {description}
                </ClampedTypography>
              </CardContent>

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
            </div>
          </StyledCard>
        </CardActionArea>
      </motion.div>

      <ShopItemDialog open={isOpen} onClose={() => setIsOpen(false)} id={id} />
    </Box>
  );
}
