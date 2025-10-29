import { config } from "dotenv";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../users/entities/user.entity";
import { Technology } from "../../technologies/entities/technology.entity";
import { Application } from "../../applications/entities/application.entity";
import { UserComponentAboutMe } from "../../users/user-components/entities/user-component-about-me.entity";
import { UserComponentEducation } from "../../users/user-components/entities/user-component-education.entity";
import { UserComponentExperience } from "../../users/user-components/entities/user-component-experience.entity";
import { UserComponentCertificate } from "../../users/user-components/entities/user-component-certificate.entity";
import { ApplicationComponentApi } from "../../applications/application-components/entities/application-component-api.entity";
import { UserComponentAboutMeHighlight } from "../../users/user-components/entities/user-component-about-me-highlight.entity";
import { UserComponentExperiencePosition } from "../../users/user-components/entities/user-component-experience-position.entity";
import { ApplicationComponentMobile } from "../../applications/application-components/entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "../../applications/application-components/entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "../../applications/application-components/entities/application-component-frontend.entity";

config();
const configService = new ConfigService();

export const TypeormMysqlModule = TypeOrmModule.forRoot({
  type: 'mysql',
  entities: [
    User,
    Technology,
    Application,
    UserComponentAboutMe,
    UserComponentEducation,
    ApplicationComponentApi,
    UserComponentExperience,
    UserComponentCertificate,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
    UserComponentAboutMeHighlight,
    UserComponentExperiencePosition,
  ],
  username: configService.get("DATABASE_USER") || 'root',
  database: configService.get("DATABASE_NAME") || 'jcoder',
  host: configService.get("BACKEND_DATABASE_HOST") || 'localhost',
  password: configService.get("DATABASE_PASSWORD") || 'password',
  port: parseInt(configService.get("BACKEND_DATABASE_PORT") || '3306'),
  synchronize: configService.get("BACKEND_SYNCHRONIZE_DATABASE") === 'true',
});
