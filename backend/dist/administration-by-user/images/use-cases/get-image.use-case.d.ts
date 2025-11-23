import { ImagesService } from '../images.service';
import { ImageStorageService } from '../services/image-storage.service';
export declare class GetImageUseCase {
    private readonly imagesService;
    private readonly imageStorageService;
    constructor(imagesService: ImagesService, imageStorageService: ImageStorageService);
    execute(id: number, filename: string): Promise<string>;
}
