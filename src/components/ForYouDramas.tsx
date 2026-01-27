"use client";

import { DramaGrid } from "@/components/DramaGrid";
import { useForYouDramas } from "@/hooks/useDramas";
import type { SupportedLanguage } from "@/types/language";
import { ItemListSchema, dramaToItemListItems } from "@/components/structured-data/ItemListSchema";

interface ForYouDramasProps {
  lang: SupportedLanguage;
}

export function ForYouDramas({ lang }: ForYouDramasProps) {
  const { data: dramas, isLoading, error } = useForYouDramas(lang);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          {lang === 'in' ? 'Gagal memuat drama. Silakan coba lagi.' : 'Failed to load dramas. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ItemList Schema for SEO */}
      {dramas && dramas.length > 0 && (
        <ItemListSchema
          itemListName={`Drama Untuk Kamu - ${lang}`}
          items={dramaToItemListItems(dramas, lang)}
        />
      )}

      <DramaGrid dramas={dramas} isLoading={isLoading} language={lang} />
    </>
  );
}
