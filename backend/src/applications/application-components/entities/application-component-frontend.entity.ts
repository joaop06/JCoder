import {
    Column,
    Entity,
    OneToOne,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import { Application } from "../../entities/application.entity";

@Entity('applications_components_frontends')
export class ApplicationComponentFrontend {
    @PrimaryColumn()
    applicationId: number;

    @OneToOne(() => Application, (application) => application.applicationComponentApi, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column({ nullable: false })
    frontendUrl: string;

    @Column({ nullable: true })
    screenshotUrl?: string;

    @Column({ nullable: true })
    associatedApiId: number;

    @ManyToOne(() => Application, { nullable: true })
    @JoinColumn({ name: 'associatedApiId' })
    associatedApi?: Application;
};
