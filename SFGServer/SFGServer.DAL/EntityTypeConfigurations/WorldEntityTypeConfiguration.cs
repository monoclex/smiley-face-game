using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SFGServer.DAL.Models;

namespace SFGServer.DAL.EntityTypeConfigurations
{
    public class WorldEntityTypeConfiguration : IEntityTypeConfiguration<World>
    {
        public void Configure(EntityTypeBuilder<World> builder)
        {
            builder.ToTable("world");

            builder.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("uuid_generate_v4()");

            builder.Property(e => e.Height).HasColumnName("height");

            builder.Property(e => e.Name)
                .HasMaxLength(64)
                .HasColumnName("name");

            builder.Property(e => e.OwnerId).HasColumnName("ownerId");

            builder.Property(e => e.RawWorldData).HasColumnName("rawWorldData");

            builder.Property(e => e.Width).HasColumnName("width");

            builder.Property(e => e.WorldDataVersion).HasColumnName("worldDataVersion");

            builder.HasOne(d => d.Owner)
                .WithMany(p => p.Worlds)
                .HasForeignKey(d => d.OwnerId)
                .HasConstraintName("FK_74411484c66ad301185b4dadab3");
        }
    }
}
