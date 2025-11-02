'use client';

import { useState, useRef } from 'react';
import { ImagesService } from '@/services/images.service';
import { useToast } from '@/components/toast/ToastContext';
import LazyImage from '@/components/ui/LazyImage';

interface CertificateImageUploadProps {
    certificateId: number;
    currentImage?: string | null;
    onImageChange?: (image: string | null) => void;
    disabled?: boolean;
    showPreview?: boolean;
}

export default function CertificateImageUpload({
    certificateId,
    currentImage,
    onImageChange,
    disabled = false,
    showPreview = true,
}: CertificateImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload the file
        uploadCertificateImage(file);
    };

    const uploadCertificateImage = async (file: File) => {
        setUploading(true);
        try {
            const updatedCertificate = await ImagesService.uploadCertificateImage(certificateId, file);
            toast.success('Certificate image uploaded successfully!');
            onImageChange?.(updatedCertificate.profileImage || null);
        } catch (error: any) {
            console.error('Error uploading certificate image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to upload certificate image';
            toast.error(errorMessage);
            setPreview(currentImage || null); // Reset preview on error
        } finally {
            setUploading(false);
        }
    };

    const deleteCertificateImage = async () => {
        if (!currentImage) return;

        setUploading(true);
        try {
            await ImagesService.deleteCertificateImage(certificateId);
            setPreview(null);
            toast.success('Certificate image deleted successfully!');
            onImageChange?.(null);
        } catch (error: any) {
            console.error('Error deleting certificate image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to delete certificate image';
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const getCertificateImageUrl = () => {
        if (preview && preview.startsWith('data:')) {
            return preview;
        }
        if (currentImage) {
            return ImagesService.getCertificateImageUrl(certificateId);
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {showPreview && (
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {getCertificateImageUrl() ? (
                            <LazyImage
                                src={getCertificateImageUrl()!}
                                alt="Certificate preview"
                                fallback="C"
                                size="custom"
                                width="w-32"
                                height="h-24"
                                rounded="rounded-lg"
                                objectFit="object-cover"
                                className="border border-jcoder"
                                rootMargin="50px"
                            />
                        ) : (
                            <div className="w-32 h-24 rounded-lg border-2 border-dashed border-jcoder flex items-center justify-center bg-jcoder-secondary">
                                <svg
                                    className="w-8 h-8 text-jcoder-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-jcoder">
                            {currentImage ? 'Current certificate image' : 'No certificate image set'}
                        </p>
                        <p className="text-xs text-jcoder-muted">
                            Recommended: 800x600px, max 5MB
                        </p>
                        <p className="text-xs text-jcoder-muted">
                            Formats: JPEG, PNG, WebP
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleFileInputClick}
                    disabled={disabled || uploading}
                    className="px-4 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                    {uploading ? 'Uploading...' : currentImage ? 'Change Image' : 'Upload Image'}
                </button>

                {currentImage && (
                    <button
                        type="button"
                        onClick={deleteCertificateImage}
                        disabled={disabled || uploading}
                        className="px-4 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                        {uploading ? 'Deleting...' : 'Delete Image'}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
            />
        </div>
    );
}

