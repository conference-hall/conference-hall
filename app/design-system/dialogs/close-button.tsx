import { XMarkIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Button } from '../button.tsx';

type Props = { onClose: VoidFunction; className?: string };

export function CloseButton({ onClose, className }: Props) {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClose}
      label={t('common.close')}
      icon={XMarkIcon}
      variant="tertiary"
      size="sm"
      className={cx('absolute top-4 right-4', className)}
    />
  );
}
