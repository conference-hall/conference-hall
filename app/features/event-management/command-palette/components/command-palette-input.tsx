import { ComboboxInput } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  query: string;
  onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isLoading?: boolean;
};

export const CommandPaletteInput = ({ query, onQueryChange, placeholder, isLoading }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center px-5 py-1">
      <div className="flex items-center gap-2 flex-1">
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <ComboboxInput
          autoFocus
          className="flex-1 border-0 bg-transparent py-3 text-gray-900 placeholder:text-gray-500 focus:ring-0 text-sm leading-6 font-medium"
          placeholder={placeholder}
          value={query}
          onChange={onQueryChange}
          autoComplete="off"
        />
      </div>
      {isLoading ? (
        <LoadingIcon className="h-4 w-4 shrink-0" aria-label={t('common.loading')} />
      ) : (
        <Text size="xs" variant="secondary">
          ⌘+K to toggle
        </Text>
      )}
    </div>
  );
};
