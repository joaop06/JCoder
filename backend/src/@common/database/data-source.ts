import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { PortfolioView } from '../../portfolio-view/entities/portfolio-view.entity';
import { Message } from '../../administration-by-user/messages/entities/message.entity';
import { EmailVerification } from '../../portfolio-view/entities/email-verification.entity';
import { Conversation } from '../../administration-by-user/messages/entities/conversation.entity';
import { Technology } from '../../administration-by-user/technologies/entities/technology.entity';
import { Application } from '../../administration-by-user/applications/entities/application.entity';
import { UserComponentAboutMe } from '../../administration-by-user/users/user-components/entities/user-component-about-me.entity';
import { UserComponentReference } from 'src/administration-by-user/users/user-components/entities/user-component-reference.entity';
import { UserComponentEducation } from '../../administration-by-user/users/user-components/entities/user-component-education.entity';
import { UserComponentExperience } from '../../administration-by-user/users/user-components/entities/user-component-experience.entity';
import { UserComponentCertificate } from '../../administration-by-user/users/user-components/entities/user-component-certificate.entity';
import { ApplicationComponentApi } from '../../administration-by-user/applications/application-components/entities/application-component-api.entity';
import { UserComponentAboutMeHighlight } from '../../administration-by-user/users/user-components/entities/user-component-about-me-highlight.entity';
import { UserComponentExperiencePosition } from '../../administration-by-user/users/user-components/entities/user-component-experience-position.entity';
import { ApplicationComponentMobile } from '../../administration-by-user/applications/application-components/entities/application-component-mobile.entity';
import { ApplicationComponentLibrary } from '../../administration-by-user/applications/application-components/entities/application-component-library.entity';
import { ApplicationComponentFrontend } from '../../administration-by-user/applications/application-components/entities/application-component-frontend.entity';

config();

const configService = {
  get: (key: string, defaultValue?: string): string | undefined => {
    return process.env[key] || defaultValue;
  },
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  entities: [
    User,
    Message,
    Technology,
    Application,
    Conversation,
    PortfolioView,
    EmailVerification,
    UserComponentAboutMe,
    UserComponentEducation,
    UserComponentReference,
    ApplicationComponentApi,
    UserComponentExperience,
    UserComponentCertificate,
    ApplicationComponentMobile,
    ApplicationComponentLibrary,
    ApplicationComponentFrontend,
    UserComponentAboutMeHighlight,
    UserComponentExperiencePosition,
  ],
  logging: true,
  synchronize: false, // Always false for migrations
  migrationsTableName: 'migrations',
  migrations: ['src/@common/database/migrations/*.ts'],
  username: configService.get('DATABASE_USER') || 'root',
  database: configService.get('DATABASE_NAME') || 'jcoder',
  password: configService.get('DATABASE_PASSWORD') || 'password',
  host: configService.get('BACKEND_DATABASE_HOST') || 'localhost',
  port: parseInt(configService.get('BACKEND_DATABASE_PORT') || '3306'),
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

