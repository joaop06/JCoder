import {
  ApplicationComponentApi,
  ApplicationComponentMobile,
  ApplicationComponentLibrary,
  ApplicationComponentFrontend,
} from "../application-components";
import { ApplicationTypeEnum } from "@/types/enums";

export interface CreateApplicationDto {
  username: string;

  name: string;

  description: string;

  applicationType: ApplicationTypeEnum;

  githubUrl?: string;

  applicationComponentApi?: ApplicationComponentApi;

  applicationComponentMobile?: ApplicationComponentMobile;

  applicationComponentLibrary?: ApplicationComponentLibrary;

  applicationComponentFrontend?: ApplicationComponentFrontend;

  technologyIds?: number[];
};
