import { ComboboxInput } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Kbd } from '~/design-system/kbd.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeText?: string;
  loading?: boolean;
};

export function CommandPaletteInput({ value, onChange, loading, closeText }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center px-5 py-1">
      <div className="flex flex-1 items-center gap-2">
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <ComboboxInput
          autoFocus
          className="flex-1 border-0 bg-transparent py-3 text-sm leading-6 font-medium text-gray-900 placeholder:text-gray-500 focus:ring-0"
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      </div>
      {loading ? (
        <LoadingIcon className="h-4 w-4 shrink-0" aria-label={t('common.loading')} />
      ) : (
        <Text size="xs" variant="secondary">
          {closeText ? closeText : <Kbd>esc</Kbd>} {t('common.close')}
        </Text>
      )}
    </div>
  );
}
