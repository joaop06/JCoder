export interface ImageProcessingConfig {
    /**
     * Maximum width in pixels
     */
    maxWidth: number;

    /**
     * Maximum height in pixels
     */
    maxHeight: number;

    /**
     * Resize fit mode: 'cover', 'contain', 'inside', 'outside', or 'fill'
     */
    fit: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';

    /**
     * Position for cover/contain fit: 'center', 'top', 'bottom', etc.
     */
    position?: string;

    /**
     * JPEG quality (1-100)
     */
    quality: number;

    /**
     * Whether to use progressive JPEG
     */
    progressive: boolean;

    /**
     * Allowed MIME types for this image type
     */
    allowedMimeTypes: string[];

    /**
     * Maximum file size in bytes
     */
    maxFileSize: number;

    /**
     * Output format: 'jpeg', 'png', 'webp', or 'original'
     */
    outputFormat?: 'jpeg' | 'png' | 'webp' | 'original';
};

export interface ResourceImageConfig {
    profile?: ImageProcessingConfig;
    gallery?: ImageProcessingConfig;
    component?: ImageProcessingConfig;
};
