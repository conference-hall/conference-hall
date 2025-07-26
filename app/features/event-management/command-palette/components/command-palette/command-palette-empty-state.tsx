import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Kbd } from '~/design-system/kbd.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { title: string; subtitle: string; hasQuery: boolean; loading?: boolean };

export const CommandPaletteEmptyState = ({ title, subtitle, hasQuery, loading }: Props) => {
  const { t } = useTranslation();

  if (hasQuery && !loading) {
    return (
      <div className="px-8 py-16 text-center">
        <div className="p-3 rounded-full bg-gray-100 w-fit mx-auto mb-6">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-2">{t('common.no-results')}</p>
        <p className="text-xs text-gray-500 mb-4">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-16 text-center">
      <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 w-fit mx-auto mb-4">
        <CommandLineIcon className="h-6 w-6 text-indigo-600" />
      </div>
      <Text size="s" weight="semibold" className="mb-2">
        {title}
      </Text>
      <Text size="xs" variant="secondary" className="mb-8">
        {subtitle}
      </Text>
      <div className="flex justify-center space-x-6">
        <div className="flex items-center space-x-1">
          <Kbd>↑↓</Kbd>
          <Text as="span" size="xs" variant="secondary">
            navigate
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <Kbd>↵</Kbd>
          <Text as="span" size="xs" variant="secondary">
            select
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
};
