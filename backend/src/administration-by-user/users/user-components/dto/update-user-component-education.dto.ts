import { PartialType } from '@nestjs/swagger';
import { CreateUserComponentEducationDto } from './create-user-component-education.dto';

export class UpdateUserComponentEducationDto extends PartialType(CreateUserComponentEducationDto) { };
