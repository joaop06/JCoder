import {
    Column,
    Entity,
    OneToOne,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MobilePlatformEnum } from "../../enums/mobile-platform.enum";

@Entity('applications_components_mobiles')
export class ApplicationComponentMobile {
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
        enum: MobilePlatformEnum,
        example: MobilePlatformEnum.ANDROID,
        description: 'Type of platform on which the mobile application was developed',
    })
    @Column({
        type: 'enum',
        nullable: false,
        enum: MobilePlatformEnum,
    })
    platform: MobilePlatformEnum;

    @ApiPropertyOptional({
        nullable: true,
        description: 'URL to download the application',
        example: 'https://example.mobile.com/download/1.1.0',
    })
    @Column({ nullable: true })
    downloadUrl?: string;

    @Column({ nullable: true })
    associatedApiId: number;

    @ManyToOne(() => Application, { nullable: true })
    @JoinColumn({ name: 'associatedApiId' })
    associatedApi?: Application;
};
