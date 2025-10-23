import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../@common/enums/role.enum';
import { ApplicationType } from '../../@common/types/entities.type';

@Entity('users')
export class User {
  @ApiProperty({
    example: 1,
    type: 'number',
    nullable: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: 'string',
    nullable: false,
    example: 'your@email.com',
  })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    enum: RoleEnum,
    nullable: false,
    example: RoleEnum.Admin,
  })
  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: false,
    default: RoleEnum.User,
  })
  role: RoleEnum;

  @ApiProperty({
    enum: RoleEnum,
    nullable: true,
    required: false,
    example: RoleEnum.Admin,
  })
  @OneToMany('Application', (application: any) => application.user)
  applications: ApplicationType[];

  @ApiProperty({
    nullable: false,
    type: () => Date,
    example: new Date(),
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    nullable: false,
    type: () => Date,
    example: new Date(),
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
    type: () => Date,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
};
