import { CreateTechnologyDto } from "./create-technology.dto";

export interface UpdateTechnologyDto extends Partial<CreateTechnologyDto> {
    isActive?: boolean;

    profileImage?: string | null;
};
