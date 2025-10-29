import { PartialType } from '@nestjs/swagger';
import { UserComponentEducationDto } from './user-component-education.dto';

export class UpdateUserComponentEducationDto extends PartialType(UserComponentEducationDto) { };

