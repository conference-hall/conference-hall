import { CheckIcon } from '@heroicons/react/16/solid';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button.tsx';

type Props = {
  code: string;
  label?: string;
};

export function CodeBlock({ code, label }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-1">
      {label ? <div className="text-sm font-medium">{label}</div> : null}
      <div className="relative">
        <code className="block overflow-x-auto rounded-md bg-gray-100 p-4 pr-16 text-xs">{code}</code>
        <Button
          icon={copied ? CheckIcon : ClipboardDocumentIcon}
          iconClassName={copied ? 'text-green-500' : undefined}
          label={copied ? t('common.copied') : t('common.copy')}
          size="xs"
          variant="secondary"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        />
      </div>
    </div>
  );
}
