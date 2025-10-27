import { XMarkIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { ButtonIcon } from '../button-icon.tsx';

type Props = { onClose: VoidFunction; className?: string };

export function CloseButton({ onClose, className }: Props) {
  const { t } = useTranslation();

  return (
    <ButtonIcon
      onClick={onClose}
      label={t('common.close')}
      icon={XMarkIcon}
      variant="tertiary"
      size="sm"
      className={cx('absolute right-4 top-4', className)}
    />
  );
}
