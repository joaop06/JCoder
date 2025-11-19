import { UserComponentExperiencePosition } from "./user-component-experience-position.entity";

export interface UserComponentExperience {
    id: number;
    username: string;
    companyName: string;
    positions?: UserComponentExperiencePosition[];
};
