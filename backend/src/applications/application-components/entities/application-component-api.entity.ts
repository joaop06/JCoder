import {
    Column,
    Entity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";

@Entity('applications_components_apis')
export class ApplicationComponentApi {
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column({ nullable: false })
    domain: string;

    @Column({ nullable: false })
    apiUrl: string;

    @Column({ nullable: false })
    documentationUrl: string;

    @Column({ nullable: true })
    healthCheckEndpoint?: string;
};
