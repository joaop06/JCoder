import { PartialType } from '@nestjs/swagger';
import { CreateUserComponentCertificateDto } from './create-user-component-certificate.dto';

export class UpdateUserComponentCertificateDto extends PartialType(CreateUserComponentCertificateDto) { };
