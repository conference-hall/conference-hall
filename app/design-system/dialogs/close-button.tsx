import { XMarkIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';

type Props = { onClose: VoidFunction };

export function CloseButton({ onClose }: Props) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="absolute right-4 top-4 rounded-lg text-gray-400 p-1 hover:bg-gray-100 hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      onClick={onClose}
    >
      <span className="sr-only">{t('common.close')}</span>
      <XMarkIcon className="size-5" aria-hidden="true" />
    </button>
  );
}
