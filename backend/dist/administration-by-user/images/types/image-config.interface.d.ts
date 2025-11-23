export interface ImageProcessingConfig {
    maxWidth: number;
    maxHeight: number;
    fit: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';
    position?: string;
    quality: number;
    progressive: boolean;
    allowedMimeTypes: string[];
    maxFileSize: number;
    outputFormat?: 'jpeg' | 'png' | 'webp' | 'original';
}
export interface ResourceImageConfig {
    profile?: ImageProcessingConfig;
    gallery?: ImageProcessingConfig;
    component?: ImageProcessingConfig;
}
export declare const DEFAULT_IMAGE_CONFIGS: Record<string, ResourceImageConfig>;
