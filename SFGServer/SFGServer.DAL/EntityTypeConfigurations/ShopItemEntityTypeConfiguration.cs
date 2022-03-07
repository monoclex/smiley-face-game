using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SFGServer.DAL.Models;

namespace SFGServer.DAL.EntityTypeConfigurations
{
    public class ShopItemEntityTypeConfiguration : IEntityTypeConfiguration<ShopItem>
    {
        public void Configure(EntityTypeBuilder<ShopItem> builder)
        {
            builder.ToTable("shop_item");

            builder.HasIndex(e => new { e.UserId, e.ShopItemId }, "user_to_item")
                .IsUnique();

            builder.Property(e => e.Id).HasColumnName("id");

            builder.Property(e => e.Purchased).HasColumnName("purchased");

            builder.Property(e => e.ShopItemId).HasColumnName("shopItemId");

            builder.Property(e => e.SpentEnergy).HasColumnName("spentEnergy");

            builder.Property(e => e.UserId).HasColumnName("userId");

            builder.HasOne(d => d.User)
                .WithMany(p => p.ShopItems)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_a4fd65108e87639f9b2c626bbff");
        }
    }
}
