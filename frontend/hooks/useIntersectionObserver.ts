import { useEffect, useState, RefObject } from 'react';

/**
 * useIntersectionObserver Hook - Detect when an element enters the viewport
 * 
 * This hook uses the Intersection Observer API to detect when an element
 * becomes visible in the viewport. Perfect for lazy loading, animations, etc.
 * 
 * @param elementRef - React ref to the element to observe
 * @param options - Intersection Observer options
 * @returns boolean indicating if element is in view
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const isInView = useIntersectionObserver(ref, {
 *   rootMargin: '50px',
 *   threshold: 0.1
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {isInView ? <HeavyComponent /> : <Placeholder />}
 *   </div>
 * );
 * ```
 */

export interface UseIntersectionObserverOptions {
    /** Margin around the root (e.g., '50px' to trigger 50px before entering viewport) */
    rootMargin?: string;
    /** Threshold for intersection (0 to 1, where 1 means 100% visible) */
    threshold?: number | number[];
    /** Custom root element (defaults to viewport) */
    root?: Element | null;
    /** Whether to disconnect observer after first intersection */
    once?: boolean;
    /** Whether the hook is enabled (useful for conditional observing) */
    enabled?: boolean;
}

export const useIntersectionObserver = (
    elementRef: RefObject<Element>,
    {
        rootMargin = '0px',
        threshold = 0,
        root = null,
        once = true,
        enabled = true,
    }: UseIntersectionObserverOptions = {}
): boolean => {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        if (!elementRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        if (once) {
                            observer.disconnect();
                        }
                    } else if (!once) {
                        setIsInView(false);
                    }
                });
            },
            {
                root,
                rootMargin,
                threshold,
            }
        );

        observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [elementRef, root, rootMargin, threshold, once, enabled]);

    return isInView;
};

/**
 * useMultipleIntersectionObserver Hook - Observe multiple elements at once
 * 
 * This hook allows you to observe multiple elements and get their visibility status.
 * Useful for tracking multiple items in a list.
 * 
 * @param elements - Array of React refs to observe
 * @param options - Intersection Observer options
 * @returns Map of element indices to their visibility status
 * 
 * @example
 * ```tsx
 * const refs = useRef<(HTMLDivElement | null)[]>([]);
 * const visibilityMap = useMultipleIntersectionObserver(
 *   refs.current.map(el => ({ current: el })),
 *   { rootMargin: '50px' }
 * );
 * ```
 */
export const useMultipleIntersectionObserver = (
    elements: RefObject<Element>[],
    options: UseIntersectionObserverOptions = {}
): Map<number, boolean> => {
    const [visibilityMap, setVisibilityMap] = useState<Map<number, boolean>>(new Map());

    useEffect(() => {
        if (!options.enabled && options.enabled !== undefined) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const newMap = new Map(visibilityMap);
                entries.forEach((entry) => {
                    const index = elements.findIndex(
                        (ref) => ref.current === entry.target
                    );
                    if (index !== -1) {
                        newMap.set(index, entry.isIntersecting);
                    }
                });
                setVisibilityMap(newMap);
            },
            {
                root: options.root || null,
                rootMargin: options.rootMargin || '0px',
                threshold: options.threshold || 0,
            }
        );

        elements.forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, [elements, options, visibilityMap]);

    return visibilityMap;
};

export default useIntersectionObserver;

