import {
  Column,
  Entity,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApplicationTypeEnum } from '../enums/application-type.enum';
import { ApplicationComponentApi } from '../application-components/entities/application-component-api.entity';
import { ApplicationComponentMobile } from '../application-components/entities/application-component-mobile.entity';
import { ApplicationComponentLibrary } from '../application-components/entities/application-component-library.entity';
import { ApplicationComponentFrontend } from '../application-components/entities/application-component-frontend.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ApplicationTypeEnum,
  })
  applicationType: ApplicationTypeEnum;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => ApplicationComponentApi, (applicationComponentApi) => applicationComponentApi.application)
  applicationComponentApi?: ApplicationComponentApi;

  @OneToOne(() => ApplicationComponentMobile, (applicationComponentMobile) => applicationComponentMobile.application)
  applicationComponentMobile?: ApplicationComponentMobile;

  @OneToOne(() => ApplicationComponentLibrary, (applicationComponentLibrary) => applicationComponentLibrary.application)
  applicationComponentLibrary?: ApplicationComponentLibrary;

  @OneToOne(() => ApplicationComponentFrontend, (applicationComponentFrontend) => applicationComponentFrontend.application)
  applicationComponentFrontend?: ApplicationComponentFrontend;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
};
