import {
    Column,
    Entity,
    OneToOne,
    OneToMany,
    JoinColumn,
    PrimaryColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserComponentAboutMeHighlight } from './user-component-about-me-highlight.entity';

@Entity('users_components_about_me')
export class UserComponentAboutMe {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked user ID',
    })
    @PrimaryColumn()
    userId: number;

    @OneToOne(() => User, (user) => user.userComponentAboutMe, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'John Doe',
        description: 'User full name',
    })
    @Column({ nullable: false })
    fullName: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'Senior Software Engineer',
        description: 'User job title/occupation',
    })
    @Column({ nullable: true })
    occupation?: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: '<p>Hello, I am a software engineer...</p>',
        description: 'Rich text description (HTML formatted)',
    })
    @Column('text', { nullable: true })
    description?: string;

    @ApiPropertyOptional({
        nullable: true,
        type: () => [UserComponentAboutMeHighlight],
        description: 'Highlights/achievements',
    })
    @OneToMany(() => UserComponentAboutMeHighlight, (highlight) => highlight.aboutMe, {
        cascade: true,
    })
    highlights?: UserComponentAboutMeHighlight[];

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

