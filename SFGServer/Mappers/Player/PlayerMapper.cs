﻿using SFGServer.Contracts.Requests.Player;
using SFGServer.Contracts.Responses.Player;
using SFGServer.DAL.Models;
using SFGServer.Models.Energy;
using SFGServer.Models.World;

namespace SFGServer.Mappers.Register;

public class PlayerMapper : Mapper<PlayerRequest, PlayerResponse, Account>
{
    public override PlayerResponse FromEntity(Account account)
    {
        return new PlayerResponse {
            Name = account.Username,
            Energy = new EnergyInfoModel {
                Energy = account.GetEnergyAt(DateTime.UtcNow),
                MaxEnergy = account.MaxEnergy,
                EnergyRegenerationRateMs = account.EnergyRegenerationRateMs,
                LastEnergyAmount = account.LastEnergyAmount,
                TimeEnergyWasAtAmount = account.TimeEnergyWasAtAmount
            },
            OwnedWorlds = account.Worlds.Select(world => new WorldModel {
                // TODO(api-revision): remove `type: "saved"` from api
                Type = "saved",
                Id = world.Id,
                Name = world.Name,

                // TODO(javascript): get player count of world
                PlayerCount = 0
            }).ToArray()
        };
    }
}
