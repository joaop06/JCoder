import { ApiProperty } from '@nestjs/swagger';
import { Application } from '../../administration-by-user/applications/entities/application.entity';

export class GetApplicationDetailsDto extends Application {
  @ApiProperty({
    type: Application,
    description: 'Detalhes completos da aplicação com todos os componentes',
  })
  declare id: number;
};
