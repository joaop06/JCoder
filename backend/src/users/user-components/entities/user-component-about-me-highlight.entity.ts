import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserComponentAboutMe } from './user-component-about-me.entity';

@Entity('users_components_about_me_highlights')
export class UserComponentAboutMeHighlight {
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
        description: 'Linked About Me component user ID',
    })
    @Column()
    userId: number;

    @ManyToOne(() => UserComponentAboutMe, (aboutMe) => aboutMe.highlights, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
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

