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

@Entity('applications_components_apis')
export class ApplicationComponentApi {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    application: Application;

    @Column('varchar', { nullable: false })
    domain: string;

    @Column('varchar', { nullable: false })
    apiUrl: string;

    @Column('varchar', { nullable: true })
    documentationUrl: string;

    @Column('varchar', { nullable: true })
    healthCheckEndpoint: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
};
