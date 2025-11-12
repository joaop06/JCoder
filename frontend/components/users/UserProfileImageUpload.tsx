'use client';

import { User } from '@/types';
import { useState, useRef } from 'react';
import LazyImage from '@/components/ui/LazyImage';
import { useToast } from '@/components/toast/ToastContext';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface UserProfileImageUploadProps {
    currentUser: User;
    onProfileImageChange?: (user: User) => void;
    disabled?: boolean;
    showPreview?: boolean;
}

export default function UserProfileImageUpload({
    currentUser,
    onProfileImageChange,
    disabled = false,
    showPreview = true,
}: UserProfileImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUser.profileImage || null);
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
            const updatedUser = await ImagesService.uploadUserProfileImage(userSession.user.username, currentUser.id, file);
            toast.success('Profile image uploaded successfully!');
            onProfileImageChange?.(updatedUser);
        } catch (error: any) {
            console.error('Error uploading profile image:', error);
            const errorMessage = error?.response?.data?.message
                || error?.message
                || 'Failed to upload profile image';
            toast.error(errorMessage);
            setPreview(currentUser.profileImage || null); // Reset preview on error
        } finally {
            setUploading(false);
        }
    };

    const deleteProfileImage = async () => {
        if (!currentUser.profileImage) return;

        const confirmed = await toast.confirm(
            'Are you sure you want to delete your profile image?',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        );

        if (!confirmed) return;

        setUploading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await ImagesService.deleteUserProfileImage(userSession.user.username, currentUser.id);
            setPreview(null);
            toast.success('Profile image deleted successfully!');

            // Update user in local storage and trigger callback
            const updatedUser = { ...currentUser, profileImage: undefined };
            onProfileImageChange?.(updatedUser);
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
        if (currentUser.profileImage) {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            return ImagesService.getUserProfileImageUrl(userSession.user.username, currentUser.id);
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
                                fallback={currentUser.fullName?.[0] || 'U'}
                                size="custom"
                                width="w-24"
                                height="h-24"
                                rounded="rounded-full"
                                objectFit="object-cover"
                                className="border-2 border-jcoder-primary"
                                rootMargin="50px"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-jcoder flex items-center justify-center bg-jcoder-secondary">
                                <svg
                                    className="w-10 h-10 text-jcoder-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-jcoder">
                            {currentUser.profileImage ? 'Current profile image' : 'No profile image set'}
                        </p>
                        <p className="text-xs text-jcoder-muted">
                            Recommended: 400x400px (square), max 5MB
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
                    {uploading ? 'Uploading...' : currentUser.profileImage ? 'Change Image' : 'Upload Image'}
                </button>

                {currentUser.profileImage && (
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

