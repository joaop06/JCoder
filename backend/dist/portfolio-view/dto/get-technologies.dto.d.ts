import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { Technology } from '../../administration-by-user/technologies/entities/technology.entity';
export declare class GetTechnologiesDto extends PaginatedResponseDto<Technology> {
    data: Technology[];
}
