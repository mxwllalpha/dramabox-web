/**
 * ItemList Schema Component
 *
 * Provides structured data for list pages (grid, search results, etc.)
 * Helps Google understand the structure and content of list pages
 *
 * Schema Type: https://schema.org/ItemList
 */

export interface DramaItem {
  name: string;
  url: string;
  image: string;
  description?: string;
  datePublished?: string;
  genre?: string[];
}

interface ItemListSchemaProps {
  itemListName: string;
  items: DramaItem[];
}

export function ItemListSchema({ itemListName, items }: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: itemListName,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TVSeries',
        name: item.name,
        url: item.url,
        image: item.image,
        ...(item.description && { description: item.description }),
        ...(item.datePublished && { datePublished: item.datePublished }),
        ...(item.genre && { genre: item.genre }),
      },
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
 * Helper function to convert Drama objects to ItemList items
 */
export function dramaToItemListItems(
  dramas: Array<{
    bookName: string;
    bookId: string;
    cover?: string;
    introduction?: string;
    tags?: string[];
  }>,
  lang: string
): DramaItem[] {
  const baseUrl = 'https://megawe.net';

  return dramas.map((drama) => ({
    name: drama.bookName,
    url: `${baseUrl}/${lang}/detail/${drama.bookId}`,
    image: drama.cover || `${baseUrl}/placeholder-poster.png`,
    description: drama.introduction,
    genre: drama.tags,
  }));
}
