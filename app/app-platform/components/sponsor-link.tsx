import { HeartIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export function SponsorLink() {
  const { t } = useTranslation();
  return (
    <a
      href="https://github.com/sponsors/conference-hall"
      target="_blank"
      className="group flex items-center gap-x-3 rounded-md bg-white p-2 px-3 font-medium text-gray-700 text-sm leading-6 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
      rel="noreferrer"
    >
      <HeartIcon
        className="h-6 w-6 shrink-0 fill-red-300 text-transparent group-hover:fill-red-400"
        aria-hidden="true"
      />
      {t('common.sponsor')}
    </a>
  );
}
