import { MigrationInterface, QueryRunner } from "typeorm";

export class NewConversationEntity1762868023511 implements MigrationInterface {
    name = 'NewConversationEntity1762868023511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`senderName\` varchar(255) NOT NULL, \`senderEmail\` varchar(255) NOT NULL, \`messageCount\` int NOT NULL DEFAULT '0', \`unreadCount\` int NOT NULL DEFAULT '0', \`lastMessageAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_f4aea302a9816d9461dd63bea7\` (\`userId\`, \`senderEmail\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`conversationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`readAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD CONSTRAINT \`FK_a9b3b5d51da1c75242055338b59\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_e5663ce0c730b2de83445e2fd19\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_e5663ce0c730b2de83445e2fd19\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP FOREIGN KEY \`FK_a9b3b5d51da1c75242055338b59\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`readAt\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`conversationId\``);
        await queryRunner.query(`DROP INDEX \`IDX_f4aea302a9816d9461dd63bea7\` ON \`conversations\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
    }

}
