import { UserComponentAboutMeHighlight } from './user-component-about-me-highlight.entity';

export interface UserComponentAboutMe {
    id: number;
    username: string;
    occupation?: string;
    description?: string;
    highlights?: UserComponentAboutMeHighlight[];
};
