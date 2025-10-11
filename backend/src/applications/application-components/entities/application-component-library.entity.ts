import {
    Column,
    Entity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity('applications_components_libraries')
export class ApplicationComponentLibrary {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked application ID'
    })
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @ApiProperty({
        nullable: false,
        description: 'URL of the library package manager',
        example: 'https://www.npmjs.com/package/your-package',
    })
    @Column({ nullable: false })
    packageManagerUrl: string;

    @ApiPropertyOptional({
        nullable: true,
        description: 'Library README contents',
    })
    @Column('text', { nullable: true })
    readmeContent?: string;
};
