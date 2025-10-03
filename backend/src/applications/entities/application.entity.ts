import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  documentationUrl: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  redirectUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
};
