import { PartialType } from '@nestjs/swagger';
import { CreateUserComponentAboutMeDto } from './create-user-component-about-me.dto';

export class UpdateUserComponentAboutMeDto extends PartialType(CreateUserComponentAboutMeDto) { };
