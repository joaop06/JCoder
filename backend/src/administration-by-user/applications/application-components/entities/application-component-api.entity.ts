import {
    Column,
    Entity,
    OneToOne,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { User } from "../../../users/entities/user.entity";
import { Application } from "../../entities/application.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity('applications_components_apis')
export class ApplicationComponentApi {
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
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    })
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, (user) => user.applicationsComponentsApis, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        nullable: false,
        example: 'example.api.com',
        description: 'Hosted API domains',
    })
    @Column({ nullable: false })
    domain: string;

    @ApiProperty({
        nullable: false,
        example: 'https://example.api.com/api/v1',
        description: 'Route to consume the application',
    })
    @Column({ nullable: false })
    apiUrl: string;

    @ApiPropertyOptional({
        nullable: true,
        example: 'https://example.api.com/docs',
        description: 'Path to verify application documentation',
    })
    @Column({ nullable: true })
    documentationUrl: string;

    @ApiPropertyOptional({
        nullable: true,
        example: 'https://example.api.com/health',
        description: 'Route to check application health',
    })
    @Column({ nullable: true })
    healthCheckEndpoint?: string;
};
