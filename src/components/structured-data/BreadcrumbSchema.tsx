/**
 * BreadcrumbList Schema Component
 *
 * Provides structured data for breadcrumb navigation
 * Enables breadcrumb trail to appear in Google search results
 *
 * Schema Type: https://schema.org/BreadcrumbList
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Helper function to generate breadcrumb items for drama pages
 */
export function generateDramaBreadcrumb(
  lang: string,
  dramaName: string,
  dramaId: string,
  currentPage?: string
): BreadcrumbItem[] {
  const baseUrl = 'https://megawe.net';
  const items: BreadcrumbItem[] = [
    { name: 'Home', url: `${baseUrl}/${lang}` },
    {
      name: 'Drama',
      url: `${baseUrl}/${lang}/terbaru`,
    },
  ];

  if (currentPage === 'detail') {
    items.push({
      name: dramaName,
      url: `${baseUrl}/${lang}/detail/${dramaId}`,
    });
  } else if (currentPage === 'watch') {
    items.push({
      name: dramaName,
      url: `${baseUrl}/${lang}/detail/${dramaId}`,
    });
    items.push({
      name: 'Episode 1',
      url: `${baseUrl}/${lang}/watch/${dramaId}`,
    });
  }

  return items;
}

/**
 * Helper function to generate breadcrumb items for category pages
 */
export function generateCategoryBreadcrumb(
  lang: string,
  category: string,
  categoryName: string
): BreadcrumbItem[] {
  const baseUrl = 'https://megawe.net';
  return [
    { name: 'Home', url: `${baseUrl}/${lang}` },
    { name: categoryName, url: `${baseUrl}/${lang}/${category}` },
  ];
}
