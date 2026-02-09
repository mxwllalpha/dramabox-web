/**
 * DramaCard Component
 *
 * Compound component pattern for flexible drama card composition.
 * Supports both simple usage and granular control over card parts.
 *
 * @example
 * // Simple usage
 * <DramaCard drama={drama} index={0} />
 *
 * @example
 * // Custom content
 * <DramaCard drama={drama} index={0}>
 *   <DramaCard.Cover />
 *   <DramaCard.Content>
 *     <DramaCard.Title />
 *     <DramaCard.Tags />
 *   </DramaCard.Content>
 * </DramaCard>
 */

import Link from "next/link";
import Image from "next/image";
import Play from 'lucide-react/dist/esm/icons/play';
import Flame from 'lucide-react/dist/esm/icons/flame';
import type { Drama } from "@/types/drama";
import type { SupportedLanguage } from "@/types/language";
import { useTranslation } from "@/hooks/useTranslation";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

/**
 * Context for sharing card data between compound components
 */
import { createContext, useContext, useMemo } from "react";

interface DramaCardContextValue {
  drama: Drama;
  language: SupportedLanguage;
  index: number;
  shouldLoad: boolean;
  isPriority: boolean;
  coverUrl: string;
  tags: string[];
  altText: string;
  t: (key: string) => string;
}

const DramaCardContext = createContext<DramaCardContextValue | null>(null);

function useDramaCardContext(): DramaCardContextValue {
  const context = useContext(DramaCardContext);
  if (!context) {
    throw new Error("DramaCard compound components must be used within DramaCard");
  }
  return context;
}

/**
 * Main Props Interface
 */
export interface DramaCardProps {
  drama: Drama;
  index?: number;
  language?: SupportedLanguage;
  className?: string;
  children?: React.ReactNode;
  href?: string;
}

/**
 * Main DramaCard Component
 */
export function DramaCard({
  drama,
  index = 0,
  language = "in",
  className = "",
  children,
  href
}: DramaCardProps) {
  const { t } = useTranslation(language);
  const coverUrl = drama.coverWap || drama.cover || "/placeholder-.svg";
  const tags = drama.tags || drama.tagNames || [];
  const altText = `${drama.bookName} - Poster drama ${tags.length > 0 ? `genre ${tags.slice(0, 2).join(', ')}` : ''}. ${drama.chapterCount} episode tersedia.`;

  // Intersection Observer for lazy loading
  const shouldObserve = index >= 6;
  const { ref, hasIntersected } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.01,
    triggerOnce: true,
    enabled: shouldObserve,
  });

  const shouldLoad = !shouldObserve || hasIntersected;
  const isPriority = index === 0;
  const linkHref = href || `/${language}/detail/${drama.bookId}`;

  // Create stable context value
  // Note: t is excluded from deps - translations are cached and t function is stable per language
  const contextValue = useMemo(
    () => ({
      drama,
      language,
      index,
      shouldLoad,
      isPriority,
      coverUrl,
      tags,
      altText,
      t,
    }),
    [drama, language, index, shouldLoad, isPriority, coverUrl, tags, altText] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // If custom children provided, use compound pattern
  if (children) {
    return (
      <DramaCardContext.Provider value={contextValue}>
        <Link
          ref={ref}
          href={linkHref}
          className={cn(
            "group relative rounded-2xl overflow-hidden card-hover animate-fade-up block",
            className
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {children}
        </Link>
      </DramaCardContext.Provider>
    );
  }

  // Default rendering
  return (
    <DramaCardContext.Provider value={contextValue}>
      <Link
        ref={ref}
        href={linkHref}
        className={cn(
          "group relative rounded-2xl overflow-hidden card-hover animate-fade-up block",
          className
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <DramaCard.Cover />
        <DramaCard.Content />
      </Link>
    </DramaCardContext.Provider>
  );
}

/**
 * Compound Component: Cover Image Section
 */
interface DramaCardCoverProps {
  className?: string;
  showPlayButton?: boolean;
}

DramaCard.Cover = function DramaCardCover({
  className = "",
  showPlayButton = true
}: DramaCardCoverProps) {
  const { shouldLoad, isPriority, coverUrl, altText, drama, index, t } = useDramaCardContext();

  return (
    <div className={cn("aspect-[2/3] relative overflow-hidden bg-muted", className)}>
      {shouldLoad ? (
        <Image
          src={coverUrl}
          alt={altText}
          title={drama.bookName}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={isPriority}
          loading={index > 0 ? 'lazy' : 'eager'}
          fetchPriority={index === 0 ? 'high' : index < 4 ? 'auto' : 'low'}
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

      {/* Badges */}
      <DramaCard.Badges />

      {/* Episode Count */}
      <DramaCard.EpisodeCount />

      {/* Play Count */}
      {drama.playCount && (
        <div className="absolute bottom-3 right-3 play-count z-10">
          <span>{drama.playCount} {t("detail.views")}</span>
        </div>
      )}

      {/* Hover Play Button */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Compound Component: Badges (Corner, Rank)
 */
DramaCard.Badges = function DramaCardBadges() {
  const { drama } = useDramaCardContext();

  return (
    <>
      {/* Corner Badge */}
      {drama.corner && (
        <div
          className="absolute top-3 left-3 badge-popular z-10"
          style={{ backgroundColor: drama.corner.color }}
        >
          {drama.corner.name}
        </div>
      )}

      {/* Rank Badge */}
      {drama.rankVo && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm z-10">
          <Flame className="w-3.5 h-3.5 text-secondary" />
          <span className="text-xs font-bold">{drama.rankVo.hotCode}</span>
        </div>
      )}
    </>
  );
};

/**
 * Compound Component: Episode Count Badge
 */
DramaCard.EpisodeCount = function DramaCardEpisodeCount() {
  const { drama, t } = useDramaCardContext();

  return (
    <div className="absolute bottom-3 left-3 episode-count z-10">
      <Play className="w-3 h-3 text-primary" />
      <span>{drama.chapterCount} {t("detail.episodes")}</span>
    </div>
  );
};

/**
 * Compound Component: Content Section
 */
interface DramaCardContentProps {
  className?: string;
  showTitle?: boolean;
  showProtagonist?: boolean;
  showTags?: boolean;
}

DramaCard.Content = function DramaCardContent({
  className = "",
  showTitle = true,
  showProtagonist = true,
  showTags = true,
}: DramaCardContentProps) {
  return (
    <div className={cn("p-4 space-y-2", className)}>
      {showTitle && <DramaCard.Title />}
      {showProtagonist && <DramaCard.Protagonist />}
      {showTags && <DramaCard.Tags />}
    </div>
  );
};

/**
 * Compound Component: Title
 */
interface DramaCardTitleProps {
  className?: string;
}

DramaCard.Title = function DramaCardTitle({ className = "" }: DramaCardTitleProps) {
  const { drama } = useDramaCardContext();

  return (
    <h3 className={cn(
      "font-display font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors",
      className
    )}>
      {drama.bookName}
    </h3>
  );
};

/**
 * Compound Component: Protagonist/Subtitle
 */
interface DramaCardProtagonistProps {
  className?: string;
}

DramaCard.Protagonist = function DramaCardProtagonist({ className = "" }: DramaCardProtagonistProps) {
  const { drama } = useDramaCardContext();

  if (!drama.protagonist) return null;

  return (
    <p className={cn("text-xs text-muted-foreground truncate", className)}>
      {drama.protagonist}
    </p>
  );
};

/**
 * Compound Component: Tags
 */
interface DramaCardTagsProps {
  className?: string;
  maxTags?: number;
}

DramaCard.Tags = function DramaCardTags({ className = "", maxTags = 2 }: DramaCardTagsProps) {
  const { tags } = useDramaCardContext();

  return (
    <div className={cn("flex flex-wrap gap-1.5 pt-1", className)}>
      {tags.slice(0, maxTags).map((tag) => (
        <span key={tag} className="tag-pill">
          {tag}
        </span>
      ))}
    </div>
  );
};
