/**
 * FAQPage Schema Component
 *
 * Provides structured data for FAQ sections
 * Enables FAQ accordion to appear in Google search results
 *
 * Schema Type: https://schema.org/FAQPage
 */

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
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
 * Default FAQ data for DramaBox
 */
export const defaultFAQs: FAQItem[] = [
  {
    question: 'Apakah nonton di DramaBox gratis?',
    answer:
      'Ya, 100% gratis! Tidak ada biaya langganan atau pembayaran per episode. Kamu bisa menikmati semua drama pendek yang tersedia tanpa mengeluarkan uang sepeserpun.',
  },
  {
    question: 'Apakah DramaBox memiliki iklan?',
    answer:
      'Tidak, DramaBox bebas iklan sepenuhnya. Kami berkomitmen memberikan pengalaman menonton yang nyaman tanpa gangguan iklan sama sekali.',
  },
  {
    question: 'Berapa banyak drama yang tersedia di DramaBox?',
    answer:
      'DramaBox memiliki ribuan judul drama pendek dari berbagai genre seperti romantis, aksi, komedi, thriller, dan banyak lagi. Koleksi kami terus bertambah setiap hari.',
  },
  {
    question: 'Bahasa apa saja yang tersedia di DramaBox?',
    answer:
      'DramaBox mendukung 11 bahasa: Bahasa Indonesia, English, ภาษาไทย (Thai), العربية (Arabic), Português (Portuguese), Français (French), Deutsch (German), 日本語 (Japanese), Español (Spanish), 繁體中文 (Chinese Traditional), dan 简体中文 (Chinese Simplified).',
  },
  {
    question: 'Apakah perlu membuat akun untuk menonton?',
    answer:
      'Tidak perlu! Kamu bisa langsung menonton drama favoritmu tanpa perlu registrasi atau login. Cari drama yang kamu suka dan langsung tonton.',
  },
  {
    question: 'Bagaimana cara mengubah bahasa tampilan?',
    answer:
      'Kamu bisa mengubah bahasa tampilan melalui menu bahasa di pojok kanan atas website. Pilih bahasa yang kamu inginkan dan konten akan otomatis menyesuaikan dengan bahasa pilihanmu.',
  },
  {
    question: 'Apakah DramaBox tersedia dalam bentuk aplikasi?',
    answer:
      'Saat ini DramaBox tersedia sebagai website yang dioptimalkan untuk mobile. Kamu bisa menikmati pengalaman seperti aplikasi dengan menambahkan website ke home screen kamu (PWA).',
  },
  {
    question: 'Bagaimana jika drama yang saya cari tidak ditemukan?',
    answer:
      'Jika drama yang kamu cari tidak ditemukan, cobalah gunakan kata kunci yang berbeda atau cek kategori drama terbaru dan terpopuler. Tim kami juga terus menambah koleksi drama setiap hari.',
  },
];
