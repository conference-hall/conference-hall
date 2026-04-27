import { useTranslation } from 'react-i18next';
import { SortMenu as SortMenuBase } from '~/design-system/list/sort-menu.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';

export function SortMenu() {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();

  const options = [
    { value: 'date', name: t('common.sort.date') },
    ...(event.displayProposalsReviews ? [{ value: 'reviews', name: t('common.sort.reviews') }] : []),
    { value: 'my-review', name: t('common.sort.my-review') },
    { value: 'comments', name: t('common.sort.comments') },
  ];

  return <SortMenuBase options={options} defaultSort="date" defaultOrder="desc" />;
}
