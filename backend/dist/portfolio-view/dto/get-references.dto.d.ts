import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentReference } from '../../administration-by-user/users/user-components/entities/user-component-reference.entity';
export declare class GetReferencesDto extends PaginatedResponseDto<UserComponentReference> {
    data: UserComponentReference[];
}
