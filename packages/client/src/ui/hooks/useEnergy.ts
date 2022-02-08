import { ZPlayerEnergy } from "@smiley-face-game/api/api";
import { useState } from "react";
import { useInterval } from "react-use";
import { usePlayer } from "./usePlayer";

interface EnergyInfo {
  energy: number;
  maxEnergy: number;
  timeLeft: string;
}

export function useEnergy(): EnergyInfo {
  const player = usePlayer();

  function useEnergyWithEnergy({
    energy: initialEnergy,
    maxEnergy,
    lastEnergyAmount,
    timeEnergyWasAtAmount,
    energyRegenerationRateMs,
  }: ZPlayerEnergy): EnergyInfo {
    function computeCurrentEnergy() {
      // a literal copy and pate of the algorithm found in packages/server/src/database/models/Account.ts
      // TODO: deduplicate this code

      // if they have more than the maximum amount of energy, don't bother counting it.
      if (lastEnergyAmount >= maxEnergy) {
        return lastEnergyAmount;
      }

      const millisecondsSinceUnixEpoch = Date.now();
      const millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - timeEnergyWasAtAmount;
      const amountOfRegeneratedEnergyPrecise = millisecondsEnergyHasBeenRegenerating / energyRegenerationRateMs;
      const amountOfRegeneratedEnergy = Math.trunc(amountOfRegeneratedEnergyPrecise); // | 0 would also work here

      // cap the energy to maxEnergy
      return Math.min(lastEnergyAmount + amountOfRegeneratedEnergy, maxEnergy);
    }

    function computeTimeLeft() {
      // if they have more than the maximum amount of energy, don't bother counting it.
      if (lastEnergyAmount >= maxEnergy) {
        return "Energy full!";
      }

      const millisecondsSinceUnixEpoch = Date.now();
      const millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - timeEnergyWasAtAmount;
      const amountOfRegeneratedEnergyPrecise = millisecondsEnergyHasBeenRegenerating / energyRegenerationRateMs;
      const amountOfRegeneratedEnergy = Math.trunc(amountOfRegeneratedEnergyPrecise); // | 0 would also work here
      const timeSpentRegeneratingEnergy = amountOfRegeneratedEnergyPrecise * energyRegenerationRateMs;
      const timeSpentRegeneratingNextEnergy = (amountOfRegeneratedEnergy + 1) * energyRegenerationRateMs;
      const timeUntilNextEnergyMs = timeSpentRegeneratingNextEnergy - timeSpentRegeneratingEnergy;
      const timeUntilNextEnergyS = Math.floor(timeUntilNextEnergyMs / 1000);

      // cap the energy to maxEnergy
      return `Energy in ${timeUntilNextEnergyS}s`;
    }

    const [energy, setEnergy] = useState(initialEnergy);
    const [timeLeft, setTimeLeft] = useState(computeTimeLeft());

    useInterval(() => {
      setEnergy(computeCurrentEnergy());
      setTimeLeft(computeTimeLeft());
    }, 1000);

    return { energy, maxEnergy, timeLeft };
  }

  return useEnergyWithEnergy(player.energy);
}
