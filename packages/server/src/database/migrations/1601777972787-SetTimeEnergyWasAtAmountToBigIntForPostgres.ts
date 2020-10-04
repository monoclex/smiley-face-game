import { MigrationInterface, QueryRunner } from "typeorm";

export class SetTimeEnergyWasAtAmountToBigIntForPostgres1601777972787 implements MigrationInterface {
    name = 'SetTimeEnergyWasAtAmountToBigIntForPostgres1601777972787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // i don't like this query
        // await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "timeEnergyWasAtAmount"`);
        // await queryRunner.query(`ALTER TABLE "account" ADD "timeEnergyWasAtAmount" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "timeEnergyWasAtAmount" TYPE bigint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // i don't like this query
        // await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "timeEnergyWasAtAmount"`);
        // await queryRunner.query(`ALTER TABLE "account" ADD "timeEnergyWasAtAmount" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "timeEnergyWasAtAmount" TYPE integer NOT NULL`);
    }

}
