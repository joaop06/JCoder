"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IMAGE_CONFIGS = void 0;
exports.DEFAULT_IMAGE_CONFIGS = {
    applications: {
        profile: {
            maxWidth: 400,
            maxHeight: 400,
            fit: 'cover',
            position: 'center',
            quality: 90,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024,
            outputFormat: 'jpeg',
        },
        gallery: {
            maxWidth: 1200,
            maxHeight: 1200,
            fit: 'inside',
            quality: 85,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024,
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
            maxFileSize: 5 * 1024 * 1024,
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
            maxFileSize: 5 * 1024 * 1024,
            outputFormat: 'jpeg',
        },
        component: {
            maxWidth: 800,
            maxHeight: 600,
            fit: 'inside',
            quality: 85,
            progressive: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            maxFileSize: 5 * 1024 * 1024,
            outputFormat: 'jpeg',
        },
    },
};
//# sourceMappingURL=image-config.interface.js.map