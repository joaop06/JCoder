import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreatePortfolioViewTable1763036986072 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
