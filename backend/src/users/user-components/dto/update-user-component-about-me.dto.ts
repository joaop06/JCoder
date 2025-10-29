import { PartialType } from '@nestjs/swagger';
import { UserComponentAboutMeDto } from './user-component-about-me.dto';

export class UpdateUserComponentAboutMeDto extends PartialType(UserComponentAboutMeDto) { };

