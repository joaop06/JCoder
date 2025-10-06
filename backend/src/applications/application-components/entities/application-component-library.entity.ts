import {
    Column,
    Entity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";

@Entity('applications_components_libraries')
export class ApplicationComponentLibrary {
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column({ nullable: false })
    packageManagerUrl: string;

    @Column('text', { nullable: true })
    readmeContent?: string;
};
