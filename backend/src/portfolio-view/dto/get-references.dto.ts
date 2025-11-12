import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentReference } from '../../administration-by-user/users/user-components/entities/user-component-reference.entity';

export class GetReferencesDto extends PaginatedResponseDto<UserComponentReference> {
  @ApiProperty({
    isArray: true,
    type: () => UserComponentReference,
    description: 'List of user references',
  })
  override data!: UserComponentReference[];
};

