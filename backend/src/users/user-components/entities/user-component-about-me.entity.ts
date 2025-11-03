import {
    Column,
    Entity,
    OneToOne,
    OneToMany,
    JoinColumn,
    PrimaryGeneratedColumn,
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
        description: 'ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'johndoe',
        description: 'Unique username used for login',
    })
    @Column({ nullable: false })
    username: string;

    @OneToOne(() => User, (user) => user.userComponentAboutMe, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'username' })
    user?: User;

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
        isArray: true,
        nullable: true,
        description: 'Highlights/achievements',
        type: () => UserComponentAboutMeHighlight,
    })
    @OneToMany(() => UserComponentAboutMeHighlight, (highlight) => highlight.aboutMe, {
        cascade: true,
    })
    highlights?: UserComponentAboutMeHighlight[];
};
