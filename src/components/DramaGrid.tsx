/**
 * DramaGrid Component
 *
 * Flexible grid component with render props pattern for custom rendering.
 * Supports default rendering with DramaCard or custom render functions.
 */

import { DramaCard } from "./DramaCard";

// Hoist static array to prevent recreation on each render
const DRAMA_GRID_SKELETON_INDICES = Array.from({ length: 12 }, (_, i) => i);
import { DramaCardSkeleton } from "./DramaCardSkeleton";
import type { Drama } from "@/types/drama";
import type { SupportedLanguage } from "@/types/language";
import { t } from "@/lib/i18n";

/**
 * Render function types for flexible composition
 */
export type RenderCardFn = (drama: Drama, index: number) => React.ReactNode;
export type RenderHeaderFn = () => React.ReactNode;
export type RenderEmptyStateFn = (language: SupportedLanguage) => React.ReactNode;
export type RenderLoadingFn = () => React.ReactNode;

/**
 * DramaGrid Props Interface
 *
 * Supports both simple props usage and render props pattern for maximum flexibility.
 *
 * @example
 * // Simple usage
 * <DramaGrid dramas={dramas} title="Popular" />
 *
 * @example
 * // With render props
 * <DramaGrid
 *   dramas={dramas}
 *   renderHeader={() => <CustomHeader />}
 *   renderCard={(drama) => <CustomCard data={drama} />}
 * />
 */
export interface DramaGridProps {
  // Data props
  dramas?: Drama[];
  isLoading?: boolean;
  language?: SupportedLanguage;
  className?: string;

  // Simple header props (use renderHeader for custom)
  title?: string;
  subtitle?: string;

  // Render props for flexible composition
  renderHeader?: RenderHeaderFn;
  renderCard?: RenderCardFn;
  renderEmptyState?: RenderEmptyStateFn;
  renderLoading?: RenderLoadingFn;
}

/**
 * Drama Grid Component with Render Props Pattern
 *
 * @example
 * // Default usage
 * <DramaGrid dramas={dramas} isLoading={loading} title="Popular" />
 *
 * @example
 * // Custom header
 * <DramaGrid
 *   dramas={dramas}
 *   renderHeader={() => <h1>Custom Header</h1>}
 * />
 *
 * @example
 * // Custom card rendering
 * <DramaGrid
 *   dramas={dramas}
 *   renderCard={(drama, index) => <MyCustomCard drama={drama} />}
 * />
 *
 * @example
 * // Custom empty state
 * <DramaGrid
 *   dramas={[]}
 *   renderEmptyState={(lang) => <div>No results for {lang}</div>}
 * />
 */
export function DramaGrid(props: DramaGridProps) {
  const {
    dramas,
    isLoading = false,
    language = "in",
    className = "",
    renderCard,
    renderHeader,
    renderEmptyState,
    renderLoading,
    title,
    subtitle,
  } = props;

  // Default card renderer
  const defaultRenderCard = (drama: Drama, index: number) => (
    <DramaCard key={drama.bookId} drama={drama} index={index} language={language} />
  );

  // Default empty state renderer
  const defaultRenderEmptyState = () => (
    <div className="text-center py-16">
      <p className="text-muted-foreground">{t(language, "errors.noDramasFound")}</p>
    </div>
  );

  // Default loading renderer
  const defaultRenderLoading = () => (
    <>
      {DRAMA_GRID_SKELETON_INDICES.map((i) => (
        <DramaCardSkeleton key={i} index={i} />
      ))}
    </>
  );

  // Header renderer
  const renderHeaderSection = () => {
    if (renderHeader) {
      return <div className="mb-6">{renderHeader()}</div>;
    }

    if (title || subtitle) {
      return (
        <div className="mb-6">
          {title && (
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <section className={`py-8 ${className}`}>
      {/* Header Section */}
      {renderHeaderSection()}

      {/* Grid Content */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {isLoading
          ? renderLoading?.() ?? defaultRenderLoading()
          : dramas
              ?.filter((drama) => drama.bookId)
              .map((drama, index) =>
                renderCard ? renderCard(drama, index) : defaultRenderCard(drama, index)
              )}
      </div>

      {/* Empty State */}
      {!isLoading && dramas?.length === 0 && (
        renderEmptyState?.(language) ?? defaultRenderEmptyState()
      )}
    </section>
  );
}

/**
 * Compound component exports for composition pattern
 */
DramaGrid.Card = DramaCard;
DramaGrid.Skeleton = DramaCardSkeleton;
