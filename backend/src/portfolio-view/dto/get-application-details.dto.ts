import { ApiProperty } from '@nestjs/swagger';
import { Application } from '../../administration-by-user/applications/entities/application.entity';

export class GetApplicationDetailsDto extends Application {
  @ApiProperty({
    type: Application,
    description: 'Complete application details with all components',
  })
  declare id: number;
};
