using Microsoft.EntityFrameworkCore;
using SFGServer.DAL.Models;

namespace SFGServer.DAL;

public class SfgContext : DbContext
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Migration> Migrations => Set<Migration>();
    public DbSet<ShopItem> ShopItems => Set<ShopItem>();
    public DbSet<TypeormMetadatum> TypeormMetadata => Set<TypeormMetadatum>();
    public DbSet<World> Worlds => Set<World>();

    public SfgContext() { }
    public SfgContext(DbContextOptions<SfgContext> options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured)
            return;

        optionsBuilder.UseNpgsql("Name=SfgDatabase", options => options.MigrationsAssembly("SFGServer.DAL"));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        // TODO(string-equallity-checks-in-queries): look into index collations (specfically for string equality checks in queries)
        // https://docs.microsoft.com/en-us/ef/core/miscellaneous/collations-and-case-sensitivity
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SfgContext).Assembly);
    }
}
