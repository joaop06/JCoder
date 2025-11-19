import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { Application } from '../../administration-by-user/applications/entities/application.entity';

export class GetApplicationsDto extends PaginatedResponseDto<Application> {
  @ApiProperty({
    isArray: true,
    type: () => Application,
    description: 'List of user applications',
  })
  override data!: Application[];
};
