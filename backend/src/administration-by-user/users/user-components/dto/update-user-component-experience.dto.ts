import { PartialType } from '@nestjs/swagger';
import { CreateUserComponentExperienceDto } from './create-user-component-experience.dto';

export class UpdateUserComponentExperienceDto extends PartialType(CreateUserComponentExperienceDto) { };
