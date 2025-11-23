import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentCertificate } from '../../administration-by-user/users/user-components/entities/user-component-certificate.entity';
export declare class GetCertificatesDto extends PaginatedResponseDto<UserComponentCertificate> {
    data: UserComponentCertificate[];
}
