import { Repository } from 'typeorm';
import { ImageStorageService } from '../services/image-storage.service';
import { UserComponentCertificate } from '../../users/user-components/entities/user-component-certificate.entity';
export declare class UploadCertificateImageUseCase {
    private readonly imageStorageService;
    private readonly certificateRepository;
    constructor(imageStorageService: ImageStorageService, certificateRepository: Repository<UserComponentCertificate>);
    execute(username: string, certificateId: number, file: Express.Multer.File): Promise<UserComponentCertificate>;
}
