import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
export declare class GetApplicationsDto extends PaginatedResponseDto<Application> {
    data: Application[];
}
