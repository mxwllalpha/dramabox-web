import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Clock from 'lucide-react/dist/esm/icons/clock';
import type { SupportedLanguage } from "@/types/language";
import { tServer } from "@/lib/i18n";

interface HeroSectionProps {
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  icon?: "sparkles" | "trending" | "clock";
  lang?: SupportedLanguage;
}

const icons = {
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
};

export async function HeroSection({
  title,
  description,
  titleKey,
  descriptionKey,
  fallbackTitle,
  fallbackDescription,
  icon = "sparkles",
  lang = "in"
}: HeroSectionProps) {
  const IconComponent = icons[icon];

  // Use translation if titleKey is provided, otherwise use title
  const displayTitle = titleKey ? await tServer(lang, titleKey) : title;
  const displayDescription = descriptionKey ? await tServer(lang, descriptionKey) : description;

  return (
    <div className="relative pt-24 pb-8 md:pt-28 md:pb-12">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-30"
             style={{ background: 'var(--gradient-glow)' }} />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl gradient-text">
            {displayTitle || fallbackTitle}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {displayDescription || fallbackDescription}
        </p>
      </div>
    </div>
  );
}
