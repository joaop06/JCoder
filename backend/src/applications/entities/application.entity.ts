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
import { ApplicationEnum } from '../enums/application.enum';
import { ApplicationComponentApi } from './components/application-component-api.entity';
import { ApplicationComponentMobile } from './components/application-component-mobile.entity';
import { ApplicationComponentLibrary } from './components/application-component-library.entity';
import { ApplicationComponentFrontend } from './components/application-component-frontend.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ApplicationEnum,
  })
  type: ApplicationEnum;

  @Column('varchar', { nullable: true })
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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
};
