import { PlusIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { SearchInput } from '~/design-system/forms/search-input.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { FiltersMenu } from './filters-menu.tsx';
import { SortMenu } from './sort-menu.tsx';

export function Filters() {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team } = useCurrentEventTeam();

  const { canCreateEventSpeaker } = team.userPermissions;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SearchInput
        placeholder={t('event-management.speakers.search')}
        ariaLabel={t('event-management.speakers.search')}
      />
      <div className="flex gap-2">
        <FiltersMenu />
        <SortMenu />
        {isFeatureEnabled && canCreateEventSpeaker && (
          <ButtonLink iconLeft={PlusIcon} to="new">
            {t('event-management.speakers.new-speaker')}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
