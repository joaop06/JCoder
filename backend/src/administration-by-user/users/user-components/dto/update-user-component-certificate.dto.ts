import { PartialType } from '@nestjs/mapped-types';
import { CreateUserComponentCertificateDto } from './create-user-component-certificate.dto';

export class UpdateUserComponentCertificateDto extends PartialType(CreateUserComponentCertificateDto) { };
