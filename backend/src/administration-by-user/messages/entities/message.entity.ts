import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
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
        description: 'ID of the administrator user who will receive the message',
    })
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, (user) => user.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'João Silva',
        description: 'Message sender name',
    })
    @Column({ nullable: false })
    senderName: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'joao@example.com',
        description: 'Message sender email',
    })
    @Column({ nullable: false })
    senderEmail: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Hello! I would like to get in touch about an opportunity...',
        description: 'Message content',
    })
    @Column('text', { nullable: false })
    message: string;

    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: true,
        description: 'ID of the conversation this message belongs to',
    })
    @Column({ nullable: true })
    conversationId?: number;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversationId' })
    conversation?: Conversation;

    @ApiProperty({
        nullable: true,
        type: () => Date,
        example: new Date(),
        description: 'Date when the message was read by the administrator',
    })
    @Column('datetime', { nullable: true })
    readAt?: Date;

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
