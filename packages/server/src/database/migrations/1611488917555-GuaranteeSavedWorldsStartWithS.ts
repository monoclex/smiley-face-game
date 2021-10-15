import { MigrationInterface, QueryRunner } from "typeorm";

export class GuaranteeSavedWorldsStartWithS1611488917555 implements MigrationInterface {
  name = "GuaranteeSavedWorldsStartWithS1611488917555";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // get all world ids
    const r = await queryRunner.query(`SELECT "id" FROM "world"`);

    // modify them to start with an "5" instead
    for (const { id } of r) {
      await queryRunner.query(`UPDATE "world" SET "id" = $1 WHERE "id" = $2`, ["5" + id.substr(1), id]);
    }

    await queryRunner.query(`ALTER TABLE "world" ALTER COLUMN "id" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "world" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
  }
}
