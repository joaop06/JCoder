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
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    })
    @Column({ nullable: false })
    username: string;

    @ManyToOne(() => User, (user) => user.applicationsComponentsFrontends, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'username' })
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

    @Column({ nullable: true })
    associatedApiId: number;

    @ManyToOne(() => Application, { nullable: true })
    @JoinColumn({ name: 'associatedApiId' })
    associatedApi?: Application;
};
