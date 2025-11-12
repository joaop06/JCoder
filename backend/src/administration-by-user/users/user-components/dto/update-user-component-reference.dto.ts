import { PartialType } from '@nestjs/swagger';
import { CreateUserComponentReferenceDto } from './create-user-component-reference.dto';

export class UpdateUserComponentReferenceDto extends PartialType(CreateUserComponentReferenceDto) { };

