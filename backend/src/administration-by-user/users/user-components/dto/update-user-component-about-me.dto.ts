import { PartialType } from '@nestjs/mapped-types';
import { CreateUserComponentAboutMeDto } from './create-user-component-about-me.dto';

export class UpdateUserComponentAboutMeDto extends PartialType(CreateUserComponentAboutMeDto) { };
