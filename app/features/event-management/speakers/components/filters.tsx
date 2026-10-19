import { PlusIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { SearchInput } from '~/design-system/forms/search-input.tsx';
import { FiltersMenu } from './filters-menu.tsx';
import { SortMenu } from './sort-menu.tsx';

export function Filters() {
  const { t } = useTranslation();
  const permissions = useUserTeamPermissions();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SearchInput
        placeholder={t('event-management.speakers.search')}
        ariaLabel={t('event-management.speakers.search')}
      />
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <FiltersMenu />

        <SortMenu />

        {permissions.canCreateEventSpeaker && (
          <>
            <Button variant="secondary" to="invite">
              {t('event-management.speakers.invite.title')}
            </Button>
            <Button iconLeft={PlusIcon} to="new">
              {t('event-management.speakers.new-speaker')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
