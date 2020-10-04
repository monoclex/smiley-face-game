import {MigrationInterface, QueryRunner} from "typeorm";

export class ActualInitialDb1601775359750 implements MigrationInterface {
    name = 'ActualInitialDb1601775359750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "world" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(64) NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "rawWorldData" text NOT NULL, "ownerId" uuid, CONSTRAINT "PK_9a0e469d5311d0d95ce1202c990" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(20) NOT NULL, "email" character varying NOT NULL, "password" character varying(64) NOT NULL, "maxEnergy" integer NOT NULL, "lastEnergyAmount" integer NOT NULL, "timeEnergyWasAtAmount" bigint NOT NULL, "energyRegenerationRateMs" integer NOT NULL, CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username"), CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "world" ADD CONSTRAINT "FK_74411484c66ad301185b4dadab3" FOREIGN KEY ("ownerId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "world" DROP CONSTRAINT "FK_74411484c66ad301185b4dadab3"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "world"`);
    }

}
