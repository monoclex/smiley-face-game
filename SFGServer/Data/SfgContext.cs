using Microsoft.EntityFrameworkCore;
using SFGServer.Models;

namespace SFGServer.Data;

public class SfgContext : DbContext
{
    public SfgContext()
    {
    }

    public SfgContext(DbContextOptions<SfgContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; } = null!;
    public virtual DbSet<Migration> Migrations { get; set; } = null!;
    public virtual DbSet<ShopItem> ShopItems { get; set; } = null!;
    public virtual DbSet<TypeormMetadatum> TypeormMetadata { get; set; } = null!;
    public virtual DbSet<World> Worlds { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured) optionsBuilder.UseNpgsql("Name=SfgDatabase");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("account");

            entity.HasIndex(e => e.Username, "UQ_41dfcb70af895ddf9a53094515b")
                .IsUnique();

            entity.HasIndex(e => e.Email, "UQ_4c8f96ccf523e9a3faefd5bdd4c")
                .IsUnique();

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");

            entity.Property(e => e.Email)
                .HasColumnType("character varying")
                .HasColumnName("email");

            entity.Property(e => e.EnergyRegenerationRateMs).HasColumnName("energyRegenerationRateMs");

            entity.Property(e => e.LastEnergyAmount).HasColumnName("lastEnergyAmount");

            entity.Property(e => e.MaxEnergy).HasColumnName("maxEnergy");

            entity.Property(e => e.Password)
                .HasMaxLength(64)
                .HasColumnName("password");

            entity.Property(e => e.TimeEnergyWasAtAmount).HasColumnName("timeEnergyWasAtAmount");

            entity.Property(e => e.Username)
                .HasMaxLength(20)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Migration>(entity =>
        {
            entity.ToTable("migrations");

            entity.Property(e => e.Id).HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");

            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
        });

        modelBuilder.Entity<ShopItem>(entity =>
        {
            entity.ToTable("shop_item");

            entity.HasIndex(e => new { e.UserId, e.ShopItemId }, "user_to_item")
                .IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");

            entity.Property(e => e.Purchased).HasColumnName("purchased");

            entity.Property(e => e.ShopItemId).HasColumnName("shopItemId");

            entity.Property(e => e.SpentEnergy).HasColumnName("spentEnergy");

            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User)
                .WithMany(p => p.ShopItems)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_a4fd65108e87639f9b2c626bbff");
        });

        modelBuilder.Entity<TypeormMetadatum>(entity =>
        {
            entity.HasNoKey();

            entity.ToTable("typeorm_metadata");

            entity.Property(e => e.Database)
                .HasColumnType("character varying")
                .HasColumnName("database");

            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");

            entity.Property(e => e.Schema)
                .HasColumnType("character varying")
                .HasColumnName("schema");

            entity.Property(e => e.Table)
                .HasColumnType("character varying")
                .HasColumnName("table");

            entity.Property(e => e.Type)
                .HasColumnType("character varying")
                .HasColumnName("type");

            entity.Property(e => e.Value).HasColumnName("value");
        });

        modelBuilder.Entity<World>(entity =>
        {
            entity.ToTable("world");

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");

            entity.Property(e => e.Height).HasColumnName("height");

            entity.Property(e => e.Name)
                .HasMaxLength(64)
                .HasColumnName("name");

            entity.Property(e => e.OwnerId).HasColumnName("ownerId");

            entity.Property(e => e.RawWorldData).HasColumnName("rawWorldData");

            entity.Property(e => e.Width).HasColumnName("width");

            entity.Property(e => e.WorldDataVersion).HasColumnName("worldDataVersion");

            entity.HasOne(d => d.Owner)
                .WithMany(p => p.Worlds)
                .HasForeignKey(d => d.OwnerId)
                .HasConstraintName("FK_74411484c66ad301185b4dadab3");
        });
    }
}
