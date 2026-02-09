/**
 * Loading State Components
 *
 * Consistent loading state patterns across the application.
 * Provides skeleton screens, spinners, and loading overlays.
 */

"use client";

import { cn } from "@/lib/utils";
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

// Hoist static array to prevent recreation on each render
const LOADING_DOTS_INDICES = [0, 1, 2] as const;

/**
 * Spinner Component
 * A simple loading spinner
 */
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Loading Skeleton Component
 * Displays a placeholder while content is loading
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
}

export function Skeleton({
  className = "",
  variant = "rectangular"
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full max-w-[200px] rounded",
    circular: "rounded-full h-12 w-12",
    rectangular: "rounded-md w-full h-12",
    rounded: "rounded-lg w-full h-24",
  };

  return (
    <div
      className={cn(
        "bg-muted animate-pulse",
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Card Skeleton Component
 * Skeleton for card-based layouts
 */
interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  lines?: number;
}

export function CardSkeleton({
  className = "",
  showImage = true,
  showTitle = true,
  showSubtitle = true,
  lines = 2,
}: CardSkeletonProps) {
  return (
    <div className={cn("p-4 space-y-3", className)}>
      {showImage && <Skeleton variant="rounded" className="w-full h-40" />}
      {showTitle && <Skeleton variant="text" className="w-3/4" />}
      {showSubtitle && <Skeleton variant="text" className="w-1/2" />}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" />
      ))}
    </div>
  );
}

/**
 * Loading Overlay Component
 * Full-screen or container overlay with spinner
 */
interface LoadingOverlayProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  fullScreen = false,
  message,
  className = ""
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "absolute inset-0 bg-background/50",
        className
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/**
 * Inline Loading Component
 * Shows loading state inline with content
 */
interface InlineLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoading({
  message,
  size = "sm",
  className = ""
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

/**
 * Grid Skeleton Component
 * Skeleton for grid-based layouts
 */
interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function GridSkeleton({
  count = 12,
  columns = 6,
  className = ""
}: GridSkeletonProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading Button Component
 * Button with loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {loading ? loadingText : children}
    </button>
  );
}

/**
 * Loading Dots Component
 * Animated dots for loading indication
 */
interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingDots({ size = "md", className = "" }: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)} aria-hidden="true">
      {LOADING_DOTS_INDICES.map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary animate-bounce",
            sizeClasses[size]
          )}
          style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }}
        />
      ))}
    </div>
  );
}

/**
 * Progress Bar Component
 * Linear progress indicator for determinate loading
 */
interface ProgressBarProps {
  value?: number; // 0-100, undefined for indeterminate
  className?: string;
}

export function ProgressBar({ value, className = "" }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full bg-muted rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-out",
          value === undefined && "animate-pulse w-1/3"
        )}
        style={value !== undefined ? { width: `${value}%` } : undefined}
      />
    </div>
  );
}
