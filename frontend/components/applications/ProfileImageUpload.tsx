'use client';

import { useState, useRef } from 'react';
import LazyImage from '@/components/ui/LazyImage';
import { useToast } from '@/components/toast/ToastContext';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface ProfileImageUploadProps {
    applicationId: number;
    currentProfileImage?: string;
    onProfileImageChange?: (profileImage: string | null) => void;
    disabled?: boolean;
    showPreview?: boolean;
}

export default function ProfileImageUpload({
    applicationId,
    currentProfileImage,
    onProfileImageChange,
    disabled = false,
    showPreview = true,
}: ProfileImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentProfileImage || null);
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
        uploadProfileImage(file);
    };

    const uploadProfileImage = async (file: File) => {
        setUploading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const updatedApplication = await ImagesService.uploadApplicationProfileImage(userSession.user.username, applicationId, file);
            toast.success('Profile image uploaded successfully!');
            onProfileImageChange?.(updatedApplication.profileImage || null);
        } catch (error: any) {
            console.error('Error uploading profile image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to upload profile image';
            toast.error(errorMessage);
            setPreview(currentProfileImage || null); // Reset preview on error
        } finally {
            setUploading(false);
        }
    };

    const updateProfileImage = async (file: File) => {
        setUploading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const updatedApplication = await ImagesService.updateApplicationProfileImage(userSession.user.username, applicationId, file);
            toast.success('Profile image updated successfully!');
            onProfileImageChange?.(updatedApplication.profileImage || null);
        } catch (error: any) {
            console.error('Error updating profile image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to update profile image';
            toast.error(errorMessage);
            setPreview(currentProfileImage || null); // Reset preview on error
        } finally {
            setUploading(false);
        }
    };

    const deleteProfileImage = async () => {
        if (!currentProfileImage) return;

        setUploading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await ImagesService.deleteApplicationProfileImage(userSession.user.username, applicationId);
            setPreview(null);
            toast.success('Profile image deleted successfully!');
            onProfileImageChange?.(null);
        } catch (error: any) {
            console.error('Error deleting profile image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to delete profile image';
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

    const getProfileImageUrl = () => {
        if (preview && preview.startsWith('data:')) {
            return preview;
        }
        if (currentProfileImage) {
            const userSession = UsersService.getUserSession();
            const username = userSession?.user?.username || '';
            return username ? ImagesService.getApplicationProfileImageUrl(username, applicationId) : '';
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {showPreview && (
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {getProfileImageUrl() ? (
                            <LazyImage
                                src={getProfileImageUrl()!}
                                alt="Profile preview"
                                fallback="P"
                                size="custom"
                                width="w-20"
                                height="h-20"
                                rounded="rounded-lg"
                                objectFit="object-cover"
                                className="border border-jcoder"
                                rootMargin="50px"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-jcoder flex items-center justify-center bg-jcoder-secondary">
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
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-jcoder-muted">
                            {currentProfileImage ? 'Current profile image' : 'No profile image set'}
                        </p>
                        <p className="text-xs text-jcoder-muted">
                            Recommended: 400x400px, max 5MB
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
                    {uploading ? 'Uploading...' : currentProfileImage ? 'Change Image' : 'Upload Image'}
                </button>

                {currentProfileImage && (
                    <button
                        type="button"
                        onClick={deleteProfileImage}
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
