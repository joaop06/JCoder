'use client';

import { useState, useRef } from 'react';
import LazyImage from '@/components/ui/LazyImage';
import { useToast } from '@/components/toast/ToastContext';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface ImageUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    applicationId?: number;
    disabled?: boolean;
}

export default function ImageUpload({ images, onImagesChange, applicationId, disabled = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                toast.error(`File ${file.name} is not a valid image type. Only JPEG, PNG and WebP are allowed.`);
                continue;
            }

            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        if (applicationId) {
            // Upload to server
            setUploading(true);
            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                const updatedApplication = await ImagesService.uploadApplicationImages(userSession.user.username, applicationId, validFiles);
                onImagesChange(updatedApplication.images || []);
                toast.success(`${validFiles.length} image(s) uploaded successfully!`);
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error.message || 'Failed to upload images';
                toast.error(errorMessage);
            } finally {
                setUploading(false);
            }
        } else {
            // Preview for new applications (before creation)
            const newImages = [...images];
            validFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    newImages.push(result);
                    onImagesChange(newImages);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleDeleteImage = async (index: number, filename?: string) => {
        if (applicationId && filename) {
            // Delete from server
            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                await ImagesService.deleteApplicationImage(userSession.user.username, applicationId, filename);
                const newImages = images.filter((_, i) => i !== index);
                onImagesChange(newImages);
                toast.success('Image deleted successfully!');
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete image';
                toast.error(errorMessage);
            }
        } else {
            // Remove from preview
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-jcoder-muted">
                Images
            </label>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver
                    ? 'border-jcoder-primary bg-jcoder-primary/10'
                    : 'border-jcoder hover:border-jcoder-primary'
                    } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={disabled || uploading}
                />

                <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-jcoder-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="text-sm text-jcoder-muted">
                        {uploading ? (
                            <span className="text-jcoder-primary">Uploading images...</span>
                        ) : (
                            <>
                                <span className="font-medium text-jcoder-primary">Click to upload</span> or drag and drop
                                <br />
                                PNG, JPG, WebP up to 5MB each
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <LazyImage
                                src={image.startsWith('data:') ? image : (applicationId ? (() => {
                                    const userSession = UsersService.getUserSession();
                                    if (!userSession?.user?.username) return '';
                                    return ImagesService.getApplicationImageUrl(userSession.user.username, applicationId, image);
                                })() : '')}
                                alt={`Application image ${index + 1}`}
                                fallback={`Img ${index + 1}`}
                                size="custom"
                                width="w-full"
                                height="aspect-square"
                                rounded="rounded-lg"
                                objectFit="object-cover"
                                rootMargin="100px"
                            />

                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index, typeof image === 'string' && !image.startsWith('data:') ? image : undefined)}
                                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
