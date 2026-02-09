'use client';

import { useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import { cn } from '@/lib/utils';
import { FAQSchema, defaultFAQs } from '@/components/structured-data/FAQSchema';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-6 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

interface FAQSectionProps {
  faqs?: Array<{ question: string; answer: string }>;
  className?: string;
}

/**
 * FAQ Section Component with SEO Schema
 *
 * Displays FAQ accordion and includes FAQPage schema
 * for rich snippets in Google search results
 */
export function FAQSection({ faqs = defaultFAQs, className }: FAQSectionProps) {
  // Track which FAQ items are open
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section
      className={cn(
        'w-full max-w-4xl mx-auto bg-card rounded-lg shadow-sm border border-border',
        className
      )}
      aria-labelledby="faq-heading"
    >
      {/* Structured Data for SEO */}
      <FAQSchema faqs={faqs} />

      {/* Section Header */}
      <div className="px-6 pt-6 pb-2 border-b border-border">
        <h2 id="faq-heading" className="text-2xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mt-1">
          Pertanyaan yang sering ditanyakan tentang DramaBox
        </p>
      </div>

      {/* FAQ Items */}
      <div className="divide-y divide-border">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Compact FAQ Section for footer or smaller spaces
 */
export function FAQSectionCompact({
  faqs = defaultFAQs.slice(0, 4),
  className,
}: FAQSectionProps) {
  return (
    <section className={cn('w-full', className)} aria-labelledby="faq-heading-compact">
      {/* Structured Data for SEO */}
      <FAQSchema faqs={faqs} />

      <h2
        id="faq-heading-compact"
        className="text-lg font-bold text-foreground mb-4"
      >
        Frequently Asked Questions
      </h2>

      <dl className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-l-2 border-primary/20 pl-4">
            <dt className="font-medium text-foreground mb-1">{faq.question}</dt>
            <dd className="text-sm text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
