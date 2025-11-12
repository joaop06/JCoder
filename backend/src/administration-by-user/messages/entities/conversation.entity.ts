import {
    Index,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
@Index(['userId', 'senderEmail'], { unique: true })
export class Conversation {
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
        description: 'ID of the administrator user who owns this conversation',
    })
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'João Silva',
        description: 'Sender name (from the most recent message)',
    })
    @Column({ nullable: false })
    senderName: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'joao@example.com',
        description: 'Sender email (unique identifier for grouping messages)',
    })
    @Column({ nullable: false })
    senderEmail: string;

    @ApiProperty({
        type: 'number',
        nullable: false,
        example: 5,
        description: 'Total number of messages in this conversation',
    })
    @Column({ nullable: false, default: 0 })
    messageCount: number;

    @ApiProperty({
        type: 'number',
        nullable: false,
        example: 2,
        description: 'Number of unread messages in this conversation',
    })
    @Column({ nullable: false, default: 0 })
    unreadCount: number;

    @ApiProperty({
        nullable: true,
        type: () => Date,
        example: new Date(),
        description: 'Date of the last message in this conversation',
    })
    @Column({ nullable: true })
    lastMessageAt?: Date;

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

    // Relations
    @ApiProperty({
        isArray: true,
        nullable: true,
        type: () => Message,
        description: 'Messages in this conversation',
    })
    @OneToMany(() => Message, (message) => message.conversation)
    messages?: Message[];
}

