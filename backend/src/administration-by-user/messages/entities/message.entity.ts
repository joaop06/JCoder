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
        description: 'ID do usuário administrador que receberá a mensagem',
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
        description: 'Nome do remetente da mensagem',
    })
    @Column({ nullable: false })
    senderName: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'joao@example.com',
        description: 'E-mail do remetente da mensagem',
    })
    @Column({ nullable: false })
    senderEmail: string;

    @ApiProperty({
        type: 'string',
        nullable: false,
        example: 'Olá! Gostaria de entrar em contato sobre uma oportunidade...',
        description: 'Conteúdo da mensagem',
    })
    @Column('text', { nullable: false })
    message: string;

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
