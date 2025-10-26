export enum TechnologyCategoryEnum {
    BACKEND = 'BACKEND',
    FRONTEND = 'FRONTEND',
    DATABASE = 'DATABASE',
    ORM = 'ORM',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    MOBILE = 'MOBILE',
    VERSION_CONTROL = 'VERSION_CONTROL',
    OTHER = 'OTHER',
}

export const TechnologyCategoryLabels: Record<TechnologyCategoryEnum, string> = {
    [TechnologyCategoryEnum.BACKEND]: 'Backend',
    [TechnologyCategoryEnum.FRONTEND]: 'Frontend',
    [TechnologyCategoryEnum.DATABASE]: 'Database',
    [TechnologyCategoryEnum.ORM]: 'ORM',
    [TechnologyCategoryEnum.INFRASTRUCTURE]: 'Infrastructure',
    [TechnologyCategoryEnum.MOBILE]: 'Mobile',
    [TechnologyCategoryEnum.VERSION_CONTROL]: 'Version Control',
    [TechnologyCategoryEnum.OTHER]: 'Other',
};
