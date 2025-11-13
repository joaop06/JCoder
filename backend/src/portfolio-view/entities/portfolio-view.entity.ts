import {
  Index,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../administration-by-user/users/entities/user.entity';

@Entity('portfolio_views')
@Index(['userId', 'ipAddress', 'fingerprint'])
@Index(['userId', 'createdAt'])
@Index(['userId', 'isOwner'])
export class PortfolioView {
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
    description: 'ID do usuário dono do portfólio acessado',
  })
  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: '192.168.1.1',
    description: 'Endereço IP do visitante',
  })
  @Column({ nullable: true, length: 45 })
  ipAddress?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'abc123def456',
    description: 'Fingerprint único do navegador para deduplicação',
  })
  @Column({ nullable: true, length: 64 })
  fingerprint?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Mozilla/5.0...',
    description: 'User Agent do navegador',
  })
  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'https://example.com',
    description: 'URL de referência (de onde veio)',
  })
  @Column({ type: 'text', nullable: true })
  referer?: string;

  @ApiProperty({
    type: 'boolean',
    default: false,
    description: 'Indica se o acesso foi do próprio dono do portfólio',
  })
  @Column({ default: false })
  isOwner: boolean;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'BR',
    description: 'Código do país do visitante (ISO 3166-1 alpha-2)',
  })
  @Column({ nullable: true, length: 2 })
  country?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'São Paulo',
    description: 'Cidade do visitante',
  })
  @Column({ nullable: true, length: 100 })
  city?: string;

  @ApiProperty({
    nullable: false,
    type: () => Date,
    example: new Date(),
  })
  @CreateDateColumn()
  createdAt: Date;
};
