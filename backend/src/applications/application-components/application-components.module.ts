import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationComponentsRepository } from "./application-componets.reposiotry";
import { ApplicationComponentApi } from "./entities/application-component-api.entity";
import { ApplicationComponentMobile } from "./entities/application-component-mobile.entity";
import { ApplicationComponentLibrary } from "./entities/application-component-library.entity";
import { ApplicationComponentFrontend } from "./entities/application-component-frontend.entity";

@Module({
    exports: [
        ApplicationComponentsRepository,
    ],
    providers: [
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
