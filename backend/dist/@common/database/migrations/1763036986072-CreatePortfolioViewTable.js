"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePortfolioViewTable1763036986072 = void 0;
class CreatePortfolioViewTable1763036986072 {
    constructor() {
        this.name = 'CreatePortfolioViewTable1763036986072';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`portfolio_views\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`ipAddress\` varchar(45) NULL, \`fingerprint\` varchar(64) NULL, \`userAgent\` text NULL, \`referer\` text NULL, \`isOwner\` tinyint NOT NULL DEFAULT 0, \`country\` varchar(2) NULL, \`city\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_993635034899185b58e56edde8\` (\`userId\`, \`isOwner\`), INDEX \`IDX_68978a1e8caa8fe4ef6b708b24\` (\`userId\`, \`createdAt\`), INDEX \`IDX_92d2d0e769f95a771057167766\` (\`userId\`, \`ipAddress\`, \`fingerprint\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`portfolio_views\` ADD CONSTRAINT \`FK_3088712e3fbd4fa2caffc25a20c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`portfolio_views\` DROP FOREIGN KEY \`FK_3088712e3fbd4fa2caffc25a20c\``);
        await queryRunner.query(`DROP INDEX \`IDX_92d2d0e769f95a771057167766\` ON \`portfolio_views\``);
        await queryRunner.query(`DROP INDEX \`IDX_68978a1e8caa8fe4ef6b708b24\` ON \`portfolio_views\``);
        await queryRunner.query(`DROP INDEX \`IDX_993635034899185b58e56edde8\` ON \`portfolio_views\``);
        await queryRunner.query(`DROP TABLE \`portfolio_views\``);
    }
}
exports.CreatePortfolioViewTable1763036986072 = CreatePortfolioViewTable1763036986072;
//# sourceMappingURL=1763036986072-CreatePortfolioViewTable.js.map