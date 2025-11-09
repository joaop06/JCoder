import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../@common/dto/pagination.dto';
import { UserComponentExperience } from '../../administration-by-user/users/user-components/entities/user-component-experience.entity';

export class GetExperiencesDto extends PaginatedResponseDto<UserComponentExperience> {
  @ApiProperty({
    isArray: true,
    type: () => UserComponentExperience,
    description: 'List of user experiences',
  })
  override data!: UserComponentExperience[];
};
