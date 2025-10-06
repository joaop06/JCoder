import { config } from "dotenv";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../users/entities/user.entity";
import { Application } from "../../applications/entities/application.entity";
import { ApplicationComponentApi } from "../../applications/application-components/entities/application-component-api.entity";
import { ApplicationComponentMobile } from "../../applications/application-components/entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "../../applications/application-components/entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "../../applications/application-components/entities/application-component-frontend.entity";

config();
const configService = new ConfigService();

export const TypeormMysqlModule = TypeOrmModule.forRoot({
  type: 'mysql',
  entities: [
    User,
    Application,
    ApplicationComponentApi,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
  ],
  username: configService.get("DATABASE_USER"),
  database: configService.get("DATABASE_NAME"),
  host: configService.get("BACKEND_DATABASE_HOST"),
  password: configService.get("DATABASE_PASSWORD"),
  port: parseInt(configService.get("BACKEND_DATABASE_PORT")),
  synchronize: configService.get("BACKEND_SYNCHRONIZE_DATABASE") === 'true',
});
