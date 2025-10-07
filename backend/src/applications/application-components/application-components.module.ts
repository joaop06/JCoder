import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationComponentsService } from "./application-components.service";
import { ApplicationComponentsRepository } from "./application-componets.reposiotry";
import { ApplicationComponentApi } from "./entities/application-component-api.entity";
import { ApplicationComponentMobile } from "./entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "./entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "./entities/application-component-frontend.entity";

@Module({
    exports: [
        ApplicationComponentsService,
    ],
    providers: [
        ApplicationComponentsService,
        ApplicationComponentsRepository,
    ],
    imports: [
        TypeOrmModule.forFeature([
            ApplicationComponentApi,
            ApplicationComponentMobile,
            ApplicationComponentLibrary,
            ApplicationComponentFrontend,
        ]),
    ],
})
export class ApplicationComponentsModule { };
