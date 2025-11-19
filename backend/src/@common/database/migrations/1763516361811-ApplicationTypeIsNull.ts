import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationTypeIsNull1763516361811 implements MigrationInterface {
    name = 'ApplicationTypeIsNull1763516361811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`applications\` CHANGE \`applicationType\` \`applicationType\` enum ('API', 'MOBILE', 'LIBRARY', 'FRONTEND', 'FULLSTACK') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`applications\` CHANGE \`applicationType\` \`applicationType\` enum ('API', 'MOBILE', 'LIBRARY', 'FRONTEND', 'FULLSTACK') NOT NULL`);
    }

}
