'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '../toast/ToastContext';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface ProfileImageUploaderProps {
    userId: number;
    currentImage?: string | null;
    userName: string; // username (unique identifier) for API requests
    displayName?: string; // display name for initials and alt text
    onImageUpdate?: (imageUrl: string | null) => void;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
    userId,
    userName,
    displayName,
    currentImage,
    onImageUpdate,
}) => {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const blobUrlRef = useRef<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(currentImage || null);
    const [imageError, setImageError] = useState(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    // Carregar imagem com autenticação e converter para blob URL
    useEffect(() => {
        // Verificar se temos todos os dados necessários e se currentImage é uma URL válida
        if (!currentImage || typeof currentImage !== 'string' || currentImage.trim() === '' || !userName || !userId) {
            // Revogar blob URL anterior se existir
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
            setBlobUrl(null);
            return;
        }

        const loadImageWithAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setImageError(true);
                    return;
                }

                const url = ImagesService.getUserProfileImageUrl(userName, userId);
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load image');
                }

                const blob = await response.blob();
                const newBlobUrl = URL.createObjectURL(blob);

                // Revogar blob URL anterior se existir
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                }

                blobUrlRef.current = newBlobUrl;
                setBlobUrl(newBlobUrl);
                setImageError(false);
            } catch (error) {
                console.error('Error loading profile image:', error);
                setImageError(true);
                setBlobUrl(null);
            }
        };

        loadImageWithAuth();

        // Cleanup: revogar blob URL quando componente desmontar ou imagem mudar
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [currentImage, userName, userId]);

    // Sincronizar imageUrl com currentImage quando mudar
    useEffect(() => {
        if (currentImage !== undefined) {
            setImageUrl(currentImage);
            setImageError(false); // Resetar erro quando a imagem mudar
        }
    }, [currentImage]);

    const handleImageError = () => {
        setImageError(true);
        setBlobUrl(null);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should not exceed 5MB');
            return;
        }

        if (!userName) {
            toast.error('Username is required');
            return;
        }

        if (!userId) {
            toast.error('User ID is required');
            return;
        }

        setIsUploading(true);
        try {
            await ImagesService.uploadUserProfileImage(userName, userId, file);
            const newImageUrl = ImagesService.getUserProfileImageUrl(userName, userId);

            // Limpar blob URL anterior
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }

            setImageError(false); // Resetar erro ao fazer upload
            setImageUrl(newImageUrl);
            setBlobUrl(null); // Forçar recarregamento
            onImageUpdate?.(newImageUrl);
            toast.success('Profile image updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteImage = async () => {
        if (!userName) {
            toast.error('Username is required');
            return;
        }

        if (!userId) {
            toast.error('User ID is required');
            return;
        }

        const confirmed = await toast.confirm(
            'Are you sure you want to delete your profile image?',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        );
        if (!confirmed) return;

        setIsUploading(true);
        try {
            await ImagesService.deleteUserProfileImage(userName, userId);

            // Limpar blob URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }

            setImageUrl(null);
            setBlobUrl(null);
            setImageError(false);
            onImageUpdate?.(null);
            toast.success('Profile image deleted successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete image');
        } finally {
            setIsUploading(false);
        }
    };

    const getInitials = () => {
        const name = displayName || userName;
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    return (
        <div className="relative group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-jcoder-card bg-gradient-to-br from-purple-500 to-pink-500">
                {blobUrl && !imageError ? (
                    <img
                        src={blobUrl}
                        alt={displayName || userName || 'Profile'}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold text-4xl">{getInitials()}</span>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Upload Image"
                        >
                            {isUploading ? (
                                <svg className="w-5 h-5 animate-spin text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                        {blobUrl && (
                            <button
                                onClick={handleDeleteImage}
                                disabled={isUploading}
                                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                title="Delete Image"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

