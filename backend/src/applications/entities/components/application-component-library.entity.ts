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

@Entity('applications_components_libraries')
export class ApplicationComponentLibrary {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Application, (application) => application.applicationComponentLibrary, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    application: Application;

    @Column('varchar', { nullable: true })
    packageManagerUrl: string;

    @Column('text', { nullable: true })
    readmeContent?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
};
