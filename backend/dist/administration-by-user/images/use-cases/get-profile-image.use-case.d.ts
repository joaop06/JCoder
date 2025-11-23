import { ImagesService } from '../images.service';
import { ImageStorageService } from '../services/image-storage.service';
export declare class GetProfileImageUseCase {
    private readonly imagesService;
    private readonly imageStorageService;
    constructor(imagesService: ImagesService, imageStorageService: ImageStorageService);
    execute(id: number): Promise<string>;
}
