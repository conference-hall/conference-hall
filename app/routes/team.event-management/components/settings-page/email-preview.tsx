import { useLayoutEffect, useRef } from 'react';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  from: string;
  subject: string;
  preview: string;
};

// todo(email): add translations
export function EmailPreview({ from, subject, preview }: Props) {
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
          <strong>From:</strong> {from}
        </Text>
        <Text variant="secondary">
          <strong>Subject:</strong> {subject}
        </Text>
      </div>
      <div ref={containerRef} className="w-full rounded-b-lg" />
    </div>
  );
}
