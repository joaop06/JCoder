import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    JoinColumn,
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
        description: 'ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    })
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, (user) => user.userComponentExperience, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Tech Company Inc.',
        description: 'Company/Organization name',
    })
    @Column({ nullable: false })
    companyName: string;

    @ApiPropertyOptional({
        isArray: true,
        nullable: true,
        type: () => UserComponentExperiencePosition,
        description: 'Positions held at this company',
    })
    @OneToMany(() => UserComponentExperiencePosition, (position) => position.experience, {
        cascade: true,
    })
    positions?: UserComponentExperiencePosition[];
};
