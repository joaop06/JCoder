import { ExpertiseLevel } from "@/types/enums";

export interface CreateTechnologyDto {
    username?: string;

    name: string;

    expertiseLevel?: ExpertiseLevel;
};
