import {
    Column,
    Entity,
    OneToOne,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";
import { MobilePlatformEnum } from "../../enums/mobile-platform.enum";

@Entity('applications_components_mobiles')
export class ApplicationComponentMobile {
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column({
        type: 'enum',
        nullable: false,
        enum: MobilePlatformEnum,
    })
    platform: MobilePlatformEnum;

    @Column()
    downloadUrl?: string;

    @Column({ nullable: true })
    associatedApiId: number;

    @ManyToOne(() => Application, { nullable: true })
    @JoinColumn({ name: 'associatedApiId' })
    associatedApi?: Application;
};
