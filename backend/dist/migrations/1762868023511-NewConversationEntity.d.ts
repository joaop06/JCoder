import { MigrationInterface, QueryRunner } from "typeorm";
export declare class NewConversationEntity1762868023511 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
