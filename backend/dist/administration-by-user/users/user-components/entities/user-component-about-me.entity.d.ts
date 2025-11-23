import { User } from '../../entities/user.entity';
import { UserComponentAboutMeHighlight } from './user-component-about-me-highlight.entity';
export declare class UserComponentAboutMe {
    id: number;
    userId: number;
    user?: User;
    occupation?: string;
    description?: string;
    highlights?: UserComponentAboutMeHighlight[];
}
