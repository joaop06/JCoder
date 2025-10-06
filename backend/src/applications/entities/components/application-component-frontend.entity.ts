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

@Entity('applications_components_frontends')
export class ApplicationComponentFrontend {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Application, (application) => application.applicationComponentFrontend, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    application: Application;

    @Column('varchar', { nullable: false })
    frontendUrl: string;

    @Column('varchar', { nullable: true })
    screenshotUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
};
