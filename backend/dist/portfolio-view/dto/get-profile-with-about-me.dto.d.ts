import { User } from "../../administration-by-user/users/entities/user.entity";
declare const GetProfileWithAboutMeDto_base: import("@nestjs/common").Type<Omit<User, keyof User>>;
export declare class GetProfileWithAboutMeDto extends GetProfileWithAboutMeDto_base {
}
export {};
