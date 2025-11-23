import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentExperience } from '../../administration-by-user/users/user-components/entities/user-component-experience.entity';
export declare class GetExperiencesDto extends PaginatedResponseDto<UserComponentExperience> {
    data: UserComponentExperience[];
}
