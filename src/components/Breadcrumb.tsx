'use client';

import Link from 'next/link';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Home from 'lucide-react/dist/esm/icons/home';
import { cn } from '@/lib/utils';
import { BreadcrumbSchema, type BreadcrumbItem } from '@/components/structured-data/BreadcrumbSchema';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Component with SEO Schema
 *
 * Displays breadcrumb navigation and includes BreadcrumbList schema
 * for rich snippets in Google search results
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbSchema items={items} />

      {/* Visual Breadcrumb */}
      <nav aria-label="Breadcrumb" className={cn('w-full', className)}>
        <ol className="flex items-center gap-2 text-sm overflow-x-auto">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                {isFirst ? (
                  <Link
                    href={item.url}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Home</span>
                  </Link>
                ) : isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Helper to create breadcrumb items from a path
 */
export function createBreadcrumbFromPath(
  lang: string,
  path: string,
  dramaName?: string,
  dramaId?: string
): BreadcrumbItem[] {
  const baseUrl = 'https://megawe.net';
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: `${baseUrl}/${lang}` },
  ];

  // Add category based on path
  if (path.includes('terbaru')) {
    items.push({ name: 'Terbaru', url: `${baseUrl}/${lang}/terbaru` });
  } else if (path.includes('terpopuler')) {
    items.push({ name: 'Terpopuler', url: `${baseUrl}/${lang}/terpopuler` });
  } else if (path.includes('sulih-suara')) {
    items.push({ name: 'Sulih Suara', url: `${baseUrl}/${lang}/sulih-suara` });
  } else if (path.includes('search')) {
    items.push({ name: 'Pencarian', url: `${baseUrl}/${lang}/search` });
  }

  // Add drama detail if available
  if (dramaName && dramaId) {
    if (path.includes('watch')) {
      // For watch pages, include detail page in breadcrumb
      items.push({
        name: dramaName,
        url: `${baseUrl}/${lang}/detail/${dramaId}`,
      });
      items.push({
        name: 'Tonton',
        url: `${baseUrl}/${lang}/watch/${dramaId}`,
      });
    } else if (path.includes('detail')) {
      items.push({
        name: dramaName,
        url: `${baseUrl}/${lang}/detail/${dramaId}`,
      });
    }
  }

  return items;
}
