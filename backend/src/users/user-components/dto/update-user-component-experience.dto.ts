import { PartialType } from '@nestjs/swagger';
import { UserComponentExperienceDto } from './user-component-experience.dto';

export class UpdateUserComponentExperienceDto extends PartialType(UserComponentExperienceDto) { };
