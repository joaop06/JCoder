import {
    Index,
    Column,
    Entity,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('email_verifications')
@Index(['email', 'code'], { unique: true })
export class EmailVerification {
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
        example: 'user@example.com',
        description: 'Email address to verify',
    })
    @Column({ nullable: false })
    @Index()
    email: string;

    @ApiProperty({
        example: '123456',
        type: 'string',
        nullable: false,
        description: 'Verification code',
    })
    @Column({ nullable: false, length: 6 })
    code: string;

    @ApiProperty({
        example: true,
        type: 'boolean',
        nullable: false,
        description: 'Whether the code has been verified',
    })
    @Column({ default: false })
    verified: boolean;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        description: 'Expiration date',
        example: '2024-01-01T00:00:00.000Z',
    })
    @Column({ type: 'datetime', nullable: false })
    expiresAt: Date;

    @ApiProperty({
        nullable: false,
        type: () => Date,
        description: 'Creation date',
        example: '2024-01-01T00:00:00.000Z',
    })
    @CreateDateColumn()
    createdAt: Date;
};
