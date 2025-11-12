import { PartialType } from '@nestjs/mapped-types';
import { CreateUserComponentExperienceDto } from './create-user-component-experience.dto';

export class UpdateUserComponentExperienceDto extends PartialType(CreateUserComponentExperienceDto) { };
