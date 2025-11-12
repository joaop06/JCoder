import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users_components_references')
export class UserComponentReference {
    @ApiProperty({
        example: 1,
        type: 'number',
        nullable: false,
        description: 'ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 1,
        type: 'string',
        nullable: false,
        description: 'User ID',
    })
    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, (user) => user.userComponentReference, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiProperty({
        type: 'string',
        nullable: false,
        description: 'Reference person name',
        example: 'Marissa Leeds',
    })
    @Column({ nullable: false })
    name: string;

    @ApiProperty({
        type: 'string',
        nullable: true,
        description: 'Company or organization name',
        example: 'Gold Coast Hotel',
    })
    @Column({ nullable: true })
    company?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        description: 'Reference email',
        example: 'mleeds@goldcoast.com',
    })
    @Column({ nullable: true })
    email?: string;

    @ApiPropertyOptional({
        type: 'string',
        nullable: true,
        description: 'Reference phone number',
        example: '732-189-0909',
    })
    @Column({ nullable: true })
    phone?: string;
};
