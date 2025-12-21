import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Kbd } from '~/design-system/kbd.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { title: string; description: string; hasQuery: boolean; loading: boolean };

export function CommandPaletteEmptyState({ title, description, hasQuery, loading }: Props) {
  const { t } = useTranslation();
  const [wasNoResults, setWasNoResults] = useState(false);

  useEffect(() => {
    if (!wasNoResults && hasQuery && !loading) {
      setWasNoResults(true);
    } else if (!hasQuery) {
      setWasNoResults(false);
    }
  }, [hasQuery, loading, wasNoResults]);

  if (hasQuery && wasNoResults) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="mx-auto mb-6 w-fit rounded-full bg-gray-100 p-3">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mb-2 font-semibold text-gray-900 text-sm">{t('common.no-results')}</p>
        <p className="mb-4 text-gray-500 text-xs">{t('event-management.command-palette.no-result.description')}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3">
        <CommandLineIcon className="h-6 w-6 text-indigo-600" />
      </div>
      <Text size="s" weight="semibold" className="mb-2">
        {title}
      </Text>
      <Text size="xs" variant="secondary" className="mb-8">
        {description}
      </Text>
      <div className="flex justify-center space-x-6">
        <div className="flex items-center space-x-1">
          <Kbd>↑↓</Kbd>
          <Text as="span" size="xs" variant="secondary">
            {t('common.navigate')}
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <Kbd>↵</Kbd>
          <Text as="span" size="xs" variant="secondary">
            {t('common.select')}
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <Kbd>esc</Kbd>
          <Text as="span" size="xs" variant="secondary">
            {t('common.close')}
          </Text>
        </div>
      </div>
    </div>
  );
}
