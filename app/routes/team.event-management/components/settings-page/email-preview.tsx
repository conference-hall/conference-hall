import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '~/shared/design-system/typography.tsx';

type Props = {
  from: string;
  subject: string;
  preview: string;
};

export function EmailPreview({ from, subject, preview }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Create or reuse shadow root
    const shadowRoot = containerRef.current.shadowRoot || containerRef.current.attachShadow({ mode: 'open' });

    // Inject preview HTML
    shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: system-ui, sans-serif;
        }
      </style>
      ${preview}
    `;
  }, [preview]);

  return (
    <div className="border border-gray-200 rounded-lg space-y-4 pb-4">
      <div className="border-b border-gray-200 rounded-t-lg bg-gray-50 p-6 space-y-4">
        <Text variant="secondary">
          <strong>{t('event-management.settings.emails.preview.from')}</strong> {from}
        </Text>
        <Text variant="secondary">
          <strong>{t('event-management.settings.emails.preview.subject')}:</strong> {subject}
        </Text>
      </div>
      <div ref={containerRef} className="w-full rounded-b-lg" />
    </div>
  );
}
