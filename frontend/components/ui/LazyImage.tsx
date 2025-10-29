'use client';

import { useState, useEffect, useRef, memo } from 'react';

/**
 * LazyImage Component - Optimized Image Loading with Intersection Observer
 * 
 * Features:
 * - Lazy loads images only when they're about to enter the viewport
 * - Shows skeleton/placeholder while loading
 * - Automatic fallback on error
 * - Smooth fade-in transition
 * - Native browser optimizations (loading="lazy", decoding="async")
 * 
 * @example
 * ```tsx
 * <LazyImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   fallback="Fallback Text"
 *   className="rounded-lg"
 *   size="medium"
 *   rootMargin="100px"
 * />
 * ```
 */

export interface LazyImageProps {
    /** Image source URL */
    src: string;
    /** Alt text for accessibility */
    alt: string;
    /** Fallback text to display on error (first character will be shown) */
    fallback: string;
    /** Additional CSS classes */
    className?: string;
    /** Predefined size or custom size classes */
    size?: 'small' | 'medium' | 'large' | 'custom';
    /** Custom width class (only used if size="custom") */
    width?: string;
    /** Custom height class (only used if size="custom") */
    height?: string;
    /** How far before the image enters viewport to start loading (default: 50px) */
    rootMargin?: string;
    /** Threshold for intersection observer (default: 0.01) */
    threshold?: number;
    /** Custom background for fallback avatar */
    fallbackBg?: string;
    /** Custom text color for fallback avatar */
    fallbackTextColor?: string;
    /** Whether to show animated skeleton while loading */
    showSkeleton?: boolean;
    /** Border radius class (default: rounded-lg) */
    rounded?: string;
    /** Object fit class (default: object-contain) */
    objectFit?: 'object-contain' | 'object-cover' | 'object-fill' | 'object-none' | 'object-scale-down';
}

export const LazyImage = memo(({
    src,
    alt,
    fallback,
    className = '',
    size = 'medium',
    width,
    height,
    rootMargin = '50px',
    threshold = 0.01,
    fallbackBg = 'bg-jcoder-gradient',
    fallbackTextColor = 'text-black',
    showSkeleton = true,
    rounded = 'rounded-lg',
    objectFit = 'object-contain',
}: LazyImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [isInView, setIsInView] = useState(false);

    // Determine size classes based on size prop
    const getSizeClasses = () => {
        if (size === 'custom' && width && height) {
            return `${width} ${height}`;
        }

        const sizes = {
            small: 'w-10 h-10',
            medium: 'w-16 h-16',
            large: 'w-24 h-24',
        };

        return sizes[size as keyof typeof sizes] || sizes.medium;
    };

    const sizeClasses = getSizeClasses();

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin,
                threshold,
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    // Render fallback avatar if image failed to load
    if (error) {
        return (
            <div
                className={`${sizeClasses} ${rounded} ${fallbackBg} flex items-center justify-center ${fallbackTextColor} font-bold flex-shrink-0 ${className}`}
                role="img"
                aria-label={alt}
            >
                {fallback.charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <div className={`${sizeClasses} ${rounded} relative flex-shrink-0`} ref={imgRef}>
            {/* Skeleton/Placeholder */}
            {showSkeleton && !loaded && isInView && (
                <div
                    className={`${sizeClasses} ${rounded} bg-jcoder-secondary animate-pulse absolute inset-0`}
                    aria-hidden="true"
                />
            )}
            {showSkeleton && !isInView && (
                <div
                    className={`${sizeClasses} ${rounded} bg-jcoder-secondary absolute inset-0`}
                    aria-hidden="true"
                />
            )}

            {/* Actual Image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className={`${className} ${sizeClasses} ${rounded} ${objectFit} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                />
            )}
        </div>
    );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

