using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SFGServer.DAL.Models;

namespace SFGServer.DAL.EntityTypeConfigurations
{
    public class TypeormMetadatumEntityTypeConfiguration : IEntityTypeConfiguration<TypeormMetadatum>
    {
        public void Configure(EntityTypeBuilder<TypeormMetadatum> builder)
        {
            builder.HasNoKey();

            builder.ToTable("typeorm_metadata");

            builder.Property(e => e.Database)
                .HasColumnType("character varying")
                .HasColumnName("database");

            builder.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");

            builder.Property(e => e.Schema)
                .HasColumnType("character varying")
                .HasColumnName("schema");

            builder.Property(e => e.Table)
                .HasColumnType("character varying")
                .HasColumnName("table");

            builder.Property(e => e.Type)
                .HasColumnType("character varying")
                .HasColumnName("type");

            builder.Property(e => e.Value).HasColumnName("value");
        }
    }
}
