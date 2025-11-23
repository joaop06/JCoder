import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentEducation } from '../../administration-by-user/users/user-components/entities/user-component-education.entity';
export declare class GetEducationsDto extends PaginatedResponseDto<UserComponentEducation> {
    data: UserComponentEducation[];
}
