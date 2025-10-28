import React, { useState } from 'react';
import { ApplicationService } from '@/services/applications.service';

interface ApplicationImagesGalleryProps {
    applicationId: number;
    images: string[];
}

const ApplicationImagesGallery: React.FC<ApplicationImagesGalleryProps> = ({
    applicationId,
    images,
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
    const [showAllImages, setShowAllImages] = useState<boolean>(false);

    // Limit of images to show initially (4 on mobile, 10 on web)
    const INITIAL_IMAGE_LIMIT_MOBILE = 4;
    const INITIAL_IMAGE_LIMIT_WEB = 10;

    // Determine current limit based on screen size
    const [isMobile, setIsMobile] = useState<boolean>(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const INITIAL_IMAGE_LIMIT = isMobile ? INITIAL_IMAGE_LIMIT_MOBILE : INITIAL_IMAGE_LIMIT_WEB;

    if (!images || images.length === 0) {
        return null;
    }

    // Determine which images to display
    const displayedImages = showAllImages ? images : images.slice(0, INITIAL_IMAGE_LIMIT);
    const hasMoreImages = images.length > INITIAL_IMAGE_LIMIT;
    // Calculate remaining images (including the last thumbnail)
    const remainingCount = images.length - (INITIAL_IMAGE_LIMIT - 1);

    const openModal = (index: number) => {
        setSelectedImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const nextImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        }
    };

    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set(prev).add(index));
    };

    const getImageUrl = (filename: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
        const url = `${baseUrl}/api/v1/images/applications/${applicationId}/images/${filename}`;
        return url;
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between mt-10 mb-2 sm:mb-3">
                    <h2 className="text-base sm:text-lg font-semibold text-jcoder-foreground">
                        Images {images.length > 0 && <span className="text-jcoder-muted">({images.length})</span>}
                    </h2>
                    {hasMoreImages && showAllImages && (
                        <button
                            onClick={() => setShowAllImages(false)}
                            className="text-sm text-jcoder-primary hover:text-jcoder-foreground transition-colors duration-200 flex items-center gap-1"
                        >
                            <span>See Less</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                    {displayedImages.map((image, displayIndex) => {
                        // Get the original index from the full images array
                        const originalIndex = images.indexOf(image);
                        // Check if this is the 4th image and we have more images
                        const isLastThumbnail = !showAllImages && hasMoreImages && displayIndex === INITIAL_IMAGE_LIMIT - 1;

                        return (
                            <div
                                key={originalIndex}
                                className="relative aspect-square rounded-md overflow-hidden cursor-pointer group hover:scale-110 transition-transform duration-200 border border-jcoder/20 hover:border-jcoder-primary/50"
                                onClick={() => {
                                    if (isLastThumbnail) {
                                        // Expand to show all images
                                        setShowAllImages(true);
                                    } else {
                                        // Open modal
                                        openModal(originalIndex);
                                    }
                                }}
                            >
                                {imageErrors.has(originalIndex) ? (
                                    <div className="w-full h-full bg-jcoder-card flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-jcoder-muted"
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
                                ) : (
                                    <>
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`Application image ${originalIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={() => handleImageError(originalIndex)}
                                        />
                                        {/* Blur overlay for the 4th thumbnail when showing limited images */}
                                        {isLastThumbnail && (
                                            <div className="absolute inset-0 backdrop-blur-md bg-black/60"></div>
                                        )}
                                    </>
                                )}

                                {/* Overlay for last thumbnail showing remaining count */}
                                {isLastThumbnail && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="text-center">
                                            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg">
                                                +{remainingCount}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Regular hover effect for non-last thumbnails */}
                                {!isLastThumbnail && (
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal for full-size image viewing */}
            {selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Backdrop with blur and dark overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal content */}
                    <div className="relative max-w-7xl max-h-full z-10">
                        {/* Close button - Fixed to top right, only visible on mobile */}
                        <button
                            onClick={closeModal}
                            className="fixed top-6 right-6 z-20 text-white/80 hover:text-white transition-colors duration-200 group sm:hidden"
                        >
                            <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/40 transition-colors duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </button>

                        {/* Navigation buttons - Fixed to screen edges */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 text-white/90 hover:text-white transition-all duration-200 group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center group-hover:bg-black/50 group-hover:scale-105 transition-all duration-200 shadow-lg">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20 text-white/90 hover:text-white transition-all duration-200 group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center group-hover:bg-black/50 group-hover:scale-105 transition-all duration-200 shadow-lg">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <div className="relative">
                            <img
                                src={getImageUrl(images[selectedImageIndex])}
                                alt={`Application image ${selectedImageIndex + 1}`}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Image dots indicator - Fixed to bottom of screen */}
                        {images.length > 1 && (
                            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md shadow-lg">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex(index);
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === selectedImageIndex
                                                ? 'bg-white scale-125'
                                                : 'bg-white/50 hover:bg-white/70'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplicationImagesGallery;
