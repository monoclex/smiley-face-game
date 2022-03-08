using SFGServer.DAL;
using SFGServer.DAL.Models;

namespace SFGServer.Services
{
    public class WorldCreatorService
    {
        private readonly SfgContext _sfgContext;

        public WorldCreatorService(SfgContext sfgContext)
        {
            _sfgContext = sfgContext;
        }

        public World CreateDefaultWorld(Account account) => CreateWorld(account, 50, 50);

        public World CreateWorld(Account owner, int width, int height)
        {
            var world = new World {
                Owner = owner,
                Name = $"{owner.Username}'s World",
                Width = width,
                Height = height,

                // TODO(javascript): generate world data
                RawWorldData = "[]",
                WorldDataVersion = 2,
            };

            _sfgContext.Worlds.Add(world);

            return world;
        }
    }
}
