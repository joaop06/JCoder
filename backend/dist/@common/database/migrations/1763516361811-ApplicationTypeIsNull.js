"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationTypeIsNull1763516361811 = void 0;
class ApplicationTypeIsNull1763516361811 {
    constructor() {
        this.name = 'ApplicationTypeIsNull1763516361811';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`applications\` CHANGE \`applicationType\` \`applicationType\` enum ('API', 'MOBILE', 'LIBRARY', 'FRONTEND', 'FULLSTACK') NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`applications\` CHANGE \`applicationType\` \`applicationType\` enum ('API', 'MOBILE', 'LIBRARY', 'FRONTEND', 'FULLSTACK') NOT NULL`);
    }
}
exports.ApplicationTypeIsNull1763516361811 = ApplicationTypeIsNull1763516361811;
//# sourceMappingURL=1763516361811-ApplicationTypeIsNull.js.map