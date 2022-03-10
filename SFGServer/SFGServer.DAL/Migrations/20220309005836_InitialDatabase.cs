using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SFGServer.DAL.Migrations
{
    public partial class InitialDatabase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "account",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    username = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    email = table.Column<string>(type: "character varying", nullable: false),
                    password = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    maxEnergy = table.Column<int>(type: "integer", nullable: false),
                    lastEnergyAmount = table.Column<int>(type: "integer", nullable: false),
                    timeEnergyWasAtAmount = table.Column<long>(type: "bigint", nullable: false),
                    energyRegenerationRateMs = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_account", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "migrations",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    timestamp = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_migrations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "typeorm_metadata",
                columns: table => new
                {
                    type = table.Column<string>(type: "character varying", nullable: false),
                    database = table.Column<string>(type: "character varying", nullable: true),
                    schema = table.Column<string>(type: "character varying", nullable: true),
                    table = table.Column<string>(type: "character varying", nullable: true),
                    name = table.Column<string>(type: "character varying", nullable: true),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "shop_item",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    shopItemId = table.Column<int>(type: "integer", nullable: false),
                    spentEnergy = table.Column<int>(type: "integer", nullable: false),
                    purchased = table.Column<int>(type: "integer", nullable: false),
                    userId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_a4fd65108e87639f9b2c626bbff",
                        column: x => x.userId,
                        principalTable: "account",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "world",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    width = table.Column<int>(type: "integer", nullable: false),
                    height = table.Column<int>(type: "integer", nullable: false),
                    rawWorldData = table.Column<string>(type: "text", nullable: false),
                    worldDataVersion = table.Column<int>(type: "integer", nullable: false),
                    ownerId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_world", x => x.id);
                    table.ForeignKey(
                        name: "FK_74411484c66ad301185b4dadab3",
                        column: x => x.ownerId,
                        principalTable: "account",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "UQ_41dfcb70af895ddf9a53094515b",
                table: "account",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_4c8f96ccf523e9a3faefd5bdd4c",
                table: "account",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "user_to_item",
                table: "shop_item",
                columns: new[] { "userId", "shopItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_world_ownerId",
                table: "world",
                column: "ownerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "migrations");

            migrationBuilder.DropTable(
                name: "shop_item");

            migrationBuilder.DropTable(
                name: "typeorm_metadata");

            migrationBuilder.DropTable(
                name: "world");

            migrationBuilder.DropTable(
                name: "account");
        }
    }
}
