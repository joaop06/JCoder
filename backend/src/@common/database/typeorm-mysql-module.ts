import { config } from "dotenv";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../administration-by-user/users/entities/user.entity";
import { Technology } from "../../administration-by-user/technologies/entities/technology.entity";
import { Application } from "../../administration-by-user/applications/entities/application.entity";
import { UserComponentAboutMe } from "../../administration-by-user/users/user-components/entities/user-component-about-me.entity";
import { UserComponentEducation } from "../../administration-by-user/users/user-components/entities/user-component-education.entity";
import { UserComponentExperience } from "../../administration-by-user/users/user-components/entities/user-component-experience.entity";
import { UserComponentCertificate } from "../../administration-by-user/users/user-components/entities/user-component-certificate.entity";
import { ApplicationComponentApi } from "../../administration-by-user/applications/application-components/entities/application-component-api.entity";
import { UserComponentAboutMeHighlight } from "../../administration-by-user/users/user-components/entities/user-component-about-me-highlight.entity";
import { UserComponentExperiencePosition } from "../../administration-by-user/users/user-components/entities/user-component-experience-position.entity";
import { ApplicationComponentMobile } from "../../administration-by-user/applications/application-components/entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "../../administration-by-user/applications/application-components/entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "../../administration-by-user/applications/application-components/entities/application-component-frontend.entity";

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
