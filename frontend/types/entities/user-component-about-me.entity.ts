export interface UserComponentAboutMeHighlight {
    id: number;
    aboutMeId: number;
    title: string;
    subtitle?: string;
    emoji?: string;
}

export interface UserComponentAboutMe {
    userId: number;
    fullName: string;
    occupation?: string;
    description?: string;
    highlights?: UserComponentAboutMeHighlight[];
}

