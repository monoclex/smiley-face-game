import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementShop1634458799080 implements MigrationInterface {
  name = "ImplementShop1634458799080";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "shop_item" ("id" SERIAL NOT NULL, "shopItemId" integer NOT NULL, "spentEnergy" integer NOT NULL, "purchased" integer NOT NULL, "userId" uuid, CONSTRAINT "user_to_item" UNIQUE ("userId", "shopItemId"), CONSTRAINT "PK_45ef796043f3b27975c32d94d20" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD CONSTRAINT "FK_a4fd65108e87639f9b2c626bbff" FOREIGN KEY ("userId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    // set the default regeneration rate to 5 minutes per energy
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    await queryRunner.query(`UPDATE "account" SET "energyRegenerationRateMs" = $1`, [5 * MINUTE]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shop_item" DROP CONSTRAINT "FK_a4fd65108e87639f9b2c626bbff"`);
    await queryRunner.query(`DROP TABLE "shop_item"`);
  }
}
