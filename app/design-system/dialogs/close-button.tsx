import { XMarkIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

type Props = { onClose: VoidFunction; className?: string };

export function CloseButton({ onClose, className }: Props) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={cx(
        'absolute right-4 top-4 rounded-lg bg-white text-gray-400 p-1 hover:bg-gray-100 hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer',
        className,
      )}
      onClick={onClose}
    >
      <span className="sr-only">{t('common.close')}</span>
      <XMarkIcon className="size-5" aria-hidden="true" />
    </button>
  );
}
