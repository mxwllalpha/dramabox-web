/**
 * Custom hook for Intersection Observer
 * Used to optimize lazy loading of images and other heavy content
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  /** Root element to use as viewport */
  root?: Element | null;
  /** Margin around the root element */
  rootMargin?: string;
  /** Threshold for triggering intersection (0-1) */
  threshold?: number | number[];
  /** Whether to disconnect observer after first intersection */
  triggerOnce?: boolean;
  /** Whether to only observe once */
  enabled?: boolean;
}

interface UseIntersectionObserverReturn {
  /** Ref to attach to target element */
  ref: (node: Element | null) => void;
  /** Whether the element is intersecting */
  isIntersecting: boolean;
  /** Whether the element has ever intersected */
  hasIntersected: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 *
 * @example
 * ```tsx
 * const { ref, isIntersecting } = useIntersectionObserver({
 *   rootMargin: '50px',
 *   threshold: 0.1,
 * });
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <HeavyComponent />}
 *   </div>
 * );
 * ```
 */
export function useIntersectionObserver({
  root = null,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = false,
  enabled = true,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    // If already intersected and triggerOnce is true, don't observe again
    if (triggerOnce && hasIntersected) {
      return;
    }

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;

        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting) {
          setHasIntersected(true);

          // Disconnect if triggerOnce is true
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    // Start observing
    const element = ref.current;
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // Note: hasIntersected is intentionally excluded from deps when triggerOnce=true
    // to prevent effect re-running after intersection. The early return handles the logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, rootMargin, threshold, triggerOnce, enabled, hasIntersected]);

  return {
    ref: (node) => {
      ref.current = node;
    },
    isIntersecting,
    hasIntersected,
  };
}
