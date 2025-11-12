import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentEducation } from '../../administration-by-user/users/user-components/entities/user-component-education.entity';

export class GetEducationsDto extends PaginatedResponseDto<UserComponentEducation> {
  @ApiProperty({
    isArray: true,
    type: () => UserComponentEducation,
    description: 'List of user educations',
  })
  override data!: UserComponentEducation[];
};
