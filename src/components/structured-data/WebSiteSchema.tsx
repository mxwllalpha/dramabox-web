/**
 * WebSite Schema Component
 *
 * Provides structured data for the website including search action
 * Enables search box to appear in Google search results
 *
 * Schema Type: https://schema.org/WebSite
 */

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DramaBox',
    url: 'https://megawe.net',
    description:
      'Nonton drama pendek gratis dan tanpa iklan. Temukan ribuan drama menarik dari berbagai genre dalam 11 bahasa.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://megawe.net/search?q={search_term_string}',
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'DramaBox',
      logo: {
        '@type': 'ImageObject',
        url: 'https://megawe.net/icon-512x512.png',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
