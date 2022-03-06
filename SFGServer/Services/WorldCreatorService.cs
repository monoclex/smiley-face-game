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

        public World CreateDefaultWorld(Account account)
        {
            return new World {
                Owner = account,
                Name = $"{account.Username}'s World",
                Width = 50,
                Height = 50,

                // TODO(javascript): generate world data
                RawWorldData = "[]",
                WorldDataVersion = 2,
            };
        }
    }
}
