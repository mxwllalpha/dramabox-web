/**
 * VideoObject Schema Component
 *
 * Provides structured data for video content (drama episodes)
 * Helps Google understand and display video content in search results
 * Enables video previews, duration, and episode information in SERP
 *
 * Schema Type: https://schema.org/VideoObject
 */

interface VideoObjectSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 format: PT1M30S = 1 minute 30 seconds
  embedUrl: string;
  episodeNumber: number;
  partOfSeries?: {
    name: string;
    url: string;
  };
}

export function VideoObjectSchema({
  title,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  embedUrl,
  episodeNumber,
  partOfSeries,
}: VideoObjectSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: uploadDate,
    duration: duration,
    embedUrl: embedUrl,
    episodeNumber: episodeNumber,
    publication: {
      '@type': 'BroadcastEvent',
      isLiveBroadcast: false,
      startDate: uploadDate,
    },
    ...(partOfSeries && {
      partOfSeries: {
        '@type': 'TVSeries',
        name: partOfSeries.name,
        url: partOfSeries.url,
      },
    }),
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: embedUrl,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      expectsAcceptanceOf: {
        '@type': 'Offer',
        category: 'free',
        price: '0',
        priceCurrency: 'USD',
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

/**
 * Helper function to convert seconds to ISO 8601 duration format
 * Example: 90 seconds -> "PT1M30S"
 */
export function secondsToISO8601Duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;

  return duration;
}
