import { UserComponentsRepository } from '../repositories';
export declare class LinkCertificateToEducationUseCase {
    private readonly userComponentsRepository;
    constructor(userComponentsRepository: UserComponentsRepository);
    execute(username: string, certificateUserId: number, educationUserId: number): Promise<void>;
}
