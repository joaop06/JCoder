import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentExperiencePosition } from './user-component-experience-position.entity';

@Entity('users_components_experiences')
export class UserComponentExperience {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked user ID',
    })
    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.userComponentExperience, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    })
    @Column({ nullable: false })
    companyName: string;

    @ApiPropertyOptional({
        nullable: true,
        type: () => [UserComponentExperiencePosition],
        description: 'Positions held at this company',
    })
    @OneToMany(() => UserComponentExperiencePosition, (position) => position.experience, {
        cascade: true,
    })
    positions?: UserComponentExperiencePosition[];

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

