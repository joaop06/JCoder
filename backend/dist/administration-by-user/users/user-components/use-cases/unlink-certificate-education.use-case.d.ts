import { UserComponentsRepository } from '../repositories';
export declare class UnlinkCertificateFromEducationUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, certificateUserId: number, educationUserId: number): Promise<void>;
}
