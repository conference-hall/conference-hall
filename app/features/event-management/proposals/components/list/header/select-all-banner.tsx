import { Trans, useTranslation } from 'react-i18next';
import { Text } from '~/design-system/typography.tsx';

type SelectAllBannerProps = {
  total: number;
  totalSelected: number;
  isCurrentPageSelected: boolean;
  isAllPagesSelected: boolean;
  toggleAllPages: VoidFunction;
};

export function SelectAllBanner({
  total,
  totalSelected,
  isCurrentPageSelected,
  isAllPagesSelected,
  toggleAllPages,
}: SelectAllBannerProps) {
  const { t } = useTranslation();

  if (isAllPagesSelected) {
    return (
      <div className="border-gray-200 border-b bg-blue-50 px-4 py-3 text-center sm:px-6">
        <Text variant="secondary" size="s">
          <Trans
            i18nKey="event-management.proposals.selection.all-pages.label"
            values={{ total }}
            components={[<strong key="1" />]}
          />
          <button type="button" className="ml-1 cursor-pointer underline hover:font-semibold" onClick={toggleAllPages}>
            {t('event-management.proposals.selection.all-pages.button')}
          </button>
        </Text>
      </div>
    );
  }

  if (!isCurrentPageSelected) return null;

  return (
    <div className="border-gray-200 border-b bg-blue-50 px-4 py-3 text-center sm:px-6">
      <Text variant="secondary" size="s">
        <Trans
          i18nKey="event-management.proposals.selection.select-all.label"
          values={{ totalSelected }}
          components={[<strong key="1" />]}
        />
        <button type="button" className="ml-1 cursor-pointer underline hover:font-semibold" onClick={toggleAllPages}>
          {t('event-management.proposals.selection.select-all.button', { total })}
        </button>
      </Text>
    </div>
  );
}
