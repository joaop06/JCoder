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

@Entity('applications_components_frontends')
export class ApplicationComponentFrontend {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked application ID'
    })
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentFrontend, {
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

    @ManyToOne(() => User, (user) => user.applicationsComponentsFrontends, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        nullable: false,
        description: 'Hosted Frontend domains',
        example: 'https://example.frontend.com',
    })
    @Column({ nullable: false })
    frontendUrl: string;

    @ApiPropertyOptional({
        nullable: true,
        required: false,
        description: 'Route to check application health',
        example: 'https://example.frontend.com/screenshot',
    })
    @Column({ nullable: true })
    screenshotUrl?: string;
};
