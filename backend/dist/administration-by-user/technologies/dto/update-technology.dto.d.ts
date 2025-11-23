import { CreateTechnologyDto } from './create-technology.dto';
declare const UpdateTechnologyDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTechnologyDto>>;
export declare class UpdateTechnologyDto extends UpdateTechnologyDto_base {
    isActive?: boolean;
    profileImage?: string | null;
}
export {};
