import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentCertificate } from '../../administration-by-user/users/user-components/entities/user-component-certificate.entity';

export class GetCertificatesDto extends PaginatedResponseDto<UserComponentCertificate> {
  @ApiProperty({
    isArray: true,
    type: () => UserComponentCertificate,
    description: 'List of user certificates',
  })
  override data!: UserComponentCertificate[];
};
