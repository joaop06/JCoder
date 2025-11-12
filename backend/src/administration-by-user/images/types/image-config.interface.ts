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
}

export interface ResourceImageConfig {
    profile?: ImageProcessingConfig;
    gallery?: ImageProcessingConfig;
    component?: ImageProcessingConfig;
}

export const DEFAULT_IMAGE_CONFIGS: Record<string, ResourceImageConfig> = {
    applications: {
        profile: {
            maxWidth: 400,
            maxHeight: 400,
            fit: 'cover',
            position: 'center',
            quality: 90,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            outputFormat: 'jpeg',
        },
        gallery: {
            maxWidth: 1200,
            maxHeight: 1200,
            fit: 'inside',
            quality: 85,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            outputFormat: 'jpeg',
        },
    },
    technologies: {
        profile: {
            maxWidth: 400,
            maxHeight: 400,
            fit: 'inside',
            quality: 90,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            outputFormat: 'png',
        },
    },
    users: {
        profile: {
            maxWidth: 400,
            maxHeight: 400,
            fit: 'cover',
            position: 'center',
            quality: 90,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            outputFormat: 'jpeg',
        },
        component: {
            maxWidth: 800,
            maxHeight: 600,
            fit: 'inside',
            quality: 85,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            outputFormat: 'jpeg',
        },
    },
};

