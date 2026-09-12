import { ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import { ExternalLink } from '../links.tsx';
import { Input } from './input.tsx';

type InputLinkProps = {
  name: string;
  label: string;
  description?: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue: string;
  error?: SubmissionError;
};

export function InputLink({ name, label, placeholder, description, icon, defaultValue, error }: InputLinkProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(defaultValue);
  const httpsUrl = URL.canParse(value) && new URL(value).protocol === 'https:' ? value : null;

  return (
    <Input
      name={name}
      type="url"
      label={label}
      icon={icon}
      placeholder={placeholder}
      value={value}
      description={description}
      onChange={(event) => setValue(event.target.value)}
      error={error}
    >
      {httpsUrl && (
        <ExternalLink
          href={httpsUrl}
          className="rounded-md px-3 text-gray-400 outline-0 focus-within:bg-indigo-50 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-inset hover:text-gray-600"
        >
          <ArrowTopRightOnSquareIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">{t('common.opens-new-tab')}</span>
        </ExternalLink>
      )}
    </Input>
  );
}
