import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserComponentReferenceAndNewFieldsInUser1762948832133 implements MigrationInterface {
    name = 'NewUserComponentReferenceAndNewFieldsInUser1762948832133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users_components_references\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`company\` varchar(255) NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users_components_references\` ADD CONSTRAINT \`FK_779b5a69f954f57f193ae1b9635\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users_components_references\` DROP FOREIGN KEY \`FK_779b5a69f954f57f193ae1b9635\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone\``);
        await queryRunner.query(`DROP TABLE \`users_components_references\``);
    }

}
