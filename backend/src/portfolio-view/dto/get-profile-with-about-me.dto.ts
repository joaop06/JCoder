import { OmitType } from "@nestjs/swagger";
import { User } from "../../administration-by-user/users/entities/user.entity";

const propertiesToOmit: readonly (keyof User)[] = [
    'messages',
    'password',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'applications',
    'technologies',
    'userComponentEducation',
    'userComponentExperience',
    'userComponentCertificate',
    'applicationsComponentsApis',
    'applicationsComponentsMobiles',
    'applicationsComponentsFrontends',
    'applicationsComponentsLibraries',
] as const;

export class GetProfileWithAboutMeDto extends OmitType(User, propertiesToOmit) { };
