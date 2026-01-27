/**
 * Organization Schema Component
 *
 * Provides structured data for the organization (DramaBox)
 * Helps search engines understand your brand, contact info, and social media presence
 *
 * Schema Type: https://schema.org/Organization
 */

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DramaBox',
    url: 'https://megawe.net',
    logo: 'https://megawe.net/icon-512x512.png',
    description:
      'Platform streaming drama pendek gratis dengan ribuan judul dari berbagai genre. Tersedia dalam 11 bahasa.',
    sameAs: [
      'https://twitter.com/dramabox',
      'https://facebook.com/dramabox',
      'https://instagram.com/dramabox',
      'https://youtube.com/@dramabox',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@megawe.net',
      availableLanguage: [
        'Indonesian',
        'English',
        'Thai',
        'Arabic',
        'Portuguese',
        'French',
        'German',
        'Japanese',
        'Spanish',
        'Chinese',
      ],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ID',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
