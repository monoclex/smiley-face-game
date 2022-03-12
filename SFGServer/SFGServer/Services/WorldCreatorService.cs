using SFGServer.DAL;
using SFGServer.DAL.Models;
using SFGServer.Game.Services;

namespace SFGServer.Services
{
    public class WorldCreatorService
    {
        private readonly SfgContext _sfgContext;
        private readonly GenerateWorldIdService _generateWorldIdService;
        private readonly GenerateBlankWorldService _generateBlankWorldService;

        public WorldCreatorService(SfgContext sfgContext, GenerateWorldIdService generateWorldIdService, GenerateBlankWorldService generateBlankWorldService)
        {
            _sfgContext = sfgContext;
            _generateWorldIdService = generateWorldIdService;
            _generateBlankWorldService = generateBlankWorldService;
        }

        public Task<World> CreateDefaultWorld(Account account, CancellationToken cancellationToken = default) => CreateWorld(account, 50, 50, cancellationToken);

        public async Task<World> CreateWorld(Account owner, uint width, uint height, CancellationToken cancellationToken)
        {
            if (width > int.MaxValue || height > int.MaxValue) throw new ArgumentException("width/height >= int max lol");

            var world = new World {
                Id = _generateWorldIdService.GenerateSavedWorld().Id,
                Owner = owner,
                Name = $"{owner.Username}'s World",
                Width = (int)width,
                Height = (int)height,
            };

            var worldData = await _generateBlankWorldService.GenerateWorld(width, height, cancellationToken);
            world.WorldDataVersion = worldData.worldDataVersion;
            world.RawWorldData = worldData.worldData;

            _sfgContext.Worlds.Add(world);

            return world;
        }
    }
}
