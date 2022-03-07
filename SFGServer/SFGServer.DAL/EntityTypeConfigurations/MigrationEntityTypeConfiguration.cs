using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SFGServer.DAL.Models;

namespace SFGServer.DAL.EntityTypeConfigurations
{
    public class MigrationEntityTypeConfiguration : IEntityTypeConfiguration<Migration>
    {
        public void Configure(EntityTypeBuilder<Migration> builder)
        {
            builder.ToTable("migrations");

            builder.Property(e => e.Id).HasColumnName("id");

            builder.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");

            builder.Property(e => e.Timestamp).HasColumnName("timestamp");
        }
    }
}
