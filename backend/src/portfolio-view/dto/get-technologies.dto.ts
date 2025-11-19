import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { Technology } from '../../administration-by-user/technologies/entities/technology.entity';

export class GetTechnologiesDto extends PaginatedResponseDto<Technology> {
  @ApiProperty({
    isArray: true,
    type: () => Technology,
    description: 'List of user technologies',
  })
  override data!: Technology[];
};
