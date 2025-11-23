import { User } from '../../entities/user.entity';
import { UserComponentExperiencePosition } from './user-component-experience-position.entity';
export declare class UserComponentExperience {
    id: number;
    userId: number;
    user?: User;
    companyName: string;
    positions?: UserComponentExperiencePosition[];
}
