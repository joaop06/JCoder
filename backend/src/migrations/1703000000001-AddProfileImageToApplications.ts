import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileImageToApplications1703000000001 implements MigrationInterface {
    name = 'AddProfileImageToApplications1703000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'applications',
            new TableColumn({
                name: 'profileImage',
                type: 'varchar',
                isNullable: true,
                comment: 'Profile image filename for the application (logo, icon, etc.)',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('applications', 'profileImage');
    }
}
