import { MigrationInterface, QueryRunner } from "typeorm";

export class WorldDataVersioning1605189206638 implements MigrationInterface {
  name = "WorldDataVersioning1605189206638";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "world" ADD "worldDataVersion" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "world" DROP COLUMN "worldDataVersion"`);
  }
}
