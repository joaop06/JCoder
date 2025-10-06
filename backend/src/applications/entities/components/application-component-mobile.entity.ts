import {
    Column,
    Entity,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Application } from "../application.entity";
import { PlatformEnum } from "../../../applications/enums/platform.enum";

@Entity('applications_components_mobiles')
export class ApplicationComponentMobile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Application, (application) => application.applicationComponentMobile, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    application: Application;

    @Column({
        type: 'enum',
        nullable: false,
        enum: PlatformEnum,
    })
    platform: PlatformEnum;

    @Column('varchar', { nullable: true })
    downloadUrl?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
};
