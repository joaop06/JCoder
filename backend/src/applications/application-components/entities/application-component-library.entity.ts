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

    @OneToOne(() => Application, (application) => application.applicationComponentLibrary, {
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

    @ManyToOne(() => User, (user) => user.applicationsComponentsLibraries, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'username' })
    user?: User;

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
