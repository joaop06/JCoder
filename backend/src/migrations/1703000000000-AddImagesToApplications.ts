import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImagesToApplications1703000000000 implements MigrationInterface {
    name = 'AddImagesToApplications1703000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'applications',
            new TableColumn({
                name: 'images',
                type: 'json',
                isNullable: true,
                comment: 'Array of image filenames associated with the application',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('applications', 'images');
    }
}
