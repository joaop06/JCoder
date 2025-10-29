import { PartialType } from '@nestjs/swagger';
import { UserComponentCertificateDto } from './user-component-certificate.dto';

export class UpdateUserComponentCertificateDto extends PartialType(UserComponentCertificateDto) { };
