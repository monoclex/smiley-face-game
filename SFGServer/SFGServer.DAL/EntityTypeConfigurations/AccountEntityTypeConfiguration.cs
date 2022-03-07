using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SFGServer.DAL.Models;

namespace SFGServer.DAL.EntityTypeConfigurations
{
    public class AccountEntityTypeConfiguration : IEntityTypeConfiguration<Account>
    {
        public void Configure(EntityTypeBuilder<Account> builder)
        {
            builder.ToTable("account");

            builder.HasIndex(e => e.Username, "UQ_41dfcb70af895ddf9a53094515b")
                .IsUnique();

            builder.HasIndex(e => e.Email, "UQ_4c8f96ccf523e9a3faefd5bdd4c")
                .IsUnique();

            builder.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");

            builder.Property(e => e.Email)
                .HasColumnType("character varying")
                .HasColumnName("email");

            builder.Property(e => e.EnergyRegenerationRateMs).HasColumnName("energyRegenerationRateMs");

            builder.Property(e => e.LastEnergyAmount).HasColumnName("lastEnergyAmount");

            builder.Property(e => e.MaxEnergy).HasColumnName("maxEnergy");

            builder.Property(e => e.Password)
                .HasMaxLength(64)
                .HasColumnName("password");

            builder.Property(e => e.TimeEnergyWasAtAmount).HasColumnName("timeEnergyWasAtAmount");

            builder.Property(e => e.Username)
                .HasMaxLength(20)
                .HasColumnName("username");
        }
    }
}
