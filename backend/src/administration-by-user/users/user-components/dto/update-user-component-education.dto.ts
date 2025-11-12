import { PartialType } from '@nestjs/mapped-types';
import { CreateUserComponentEducationDto } from './create-user-component-education.dto';

export class UpdateUserComponentEducationDto extends PartialType(CreateUserComponentEducationDto) { };
