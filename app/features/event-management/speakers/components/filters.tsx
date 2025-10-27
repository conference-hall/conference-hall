import { PlusIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { SearchInput } from '~/design-system/forms/search-input.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { FiltersMenu } from './filters-menu.tsx';
import { SortMenu } from './sort-menu.tsx';

export function Filters() {
  const { t } = useTranslation();
  const { team } = useCurrentEventTeam();

  const { canCreateEventSpeaker } = team.userPermissions;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SearchInput
        placeholder={t('event-management.speakers.search')}
        ariaLabel={t('event-management.speakers.search')}
      />
      <div className="flex justify-between gap-2">
        <FiltersMenu />

        <SortMenu />

        {canCreateEventSpeaker && (
          <Button iconLeft={PlusIcon} to="new" block>
            {t('event-management.speakers.new-speaker')}
          </Button>
        )}
      </div>
    </div>
  );
}
