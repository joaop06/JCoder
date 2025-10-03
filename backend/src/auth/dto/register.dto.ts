import { User } from '../entities/user.entity';
import { PickType } from '@nestjs/mapped-types';

export class RegisterDto extends PickType(User, ['username', 'password'] as const) { };
