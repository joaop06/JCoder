import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';
import { UserComponentAboutMe } from './user-component-about-me.entity';

@Entity('users_components_about_me_highlights')
export class UserComponentAboutMeHighlight {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked user ID',
    })
    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'Linked About Me component user ID',
    })
    @PrimaryColumn()
    aboutMeId: number;

    @ManyToOne(() => UserComponentAboutMe, (aboutMe) => aboutMe.highlights, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'aboutMeId', referencedColumnName: 'userId' })
    aboutMe: UserComponentAboutMe;

    @ApiProperty({
        type: 'string',
        nullable: false,
        description: 'Highlight title',
        example: '10+ Years Experience',
    })
    @Column({ nullable: false })
    title: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: 'Building amazing software',
        description: 'Highlight subtitle',
    })
    @Column({ nullable: true })
    subtitle?: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        example: '🚀',
        description: 'Emoji icon for the highlight',
    })
    @Column({ nullable: true })
    emoji?: string;
};
