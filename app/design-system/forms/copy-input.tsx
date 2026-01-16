import { CheckIcon } from '@heroicons/react/20/solid';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function CopyInput({ id, type = 'text', value, className, ...rest }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(() => setCopied(true));
  };

  return (
    <div className={className}>
      <div className="mt-1 flex rounded-md">
        <div className="relative flex grow items-stretch focus-within:z-10">
          <input
            id={id}
            type={type}
            value={value}
            className="block w-full rounded-none rounded-l-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            {...rest}
          />
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="relative -ml-px inline-flex cursor-pointer items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
        >
          {copied ? (
            <>
              <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
              <span>{t('common.copied')}</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>{t('common.copy')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
