import { useFetcher } from 'react-router';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { CategoriesSelectPanel } from '../../new-proposal/categories-select-panel.tsx';

type CategoriesSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalCategories: Array<{ id: string; name: string }>;
  eventCategories: Array<{ id: string; name: string }>;
  canEditEventProposals: boolean;
  canEditEvent: boolean;
  className?: string;
};

export function CategoriesSection({
  team,
  event,
  proposalId,
  proposalCategories,
  eventCategories,
  canEditEventProposals,
  canEditEvent,
  className,
}: CategoriesSectionProps) {
  const fetcher = useFetcher({ key: `save-categories:${proposalId}` });

  // optimistic update
  let displayed = proposalCategories;
  if (fetcher.formData?.get('intent') === 'save-categories') {
    const pending = fetcher.formData?.getAll('categories') as string[];
    displayed = eventCategories.filter((tag) => pending.includes(tag.id));
  }
  displayed = sortBy(displayed, 'name');

  const update = (tags: Array<{ id: string; name: string }>) => {
    const formData = new FormData();
    formData.set('intent', 'save-categories');
    for (const tag of tags) {
      formData.append('categories', tag.id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <CategoriesSelectPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({ value: item.id, label: item.name }))}
      options={eventCategories.map((item) => ({ value: item.id, label: item.name }))}
      onChange={(selected) => {
        update(selected.map((option) => eventCategories.find((item) => item.id === option.value)!).filter(Boolean));
      }}
      readonly={!canEditEventProposals}
      showAction={canEditEvent}
      className={className}
    />
  );
}
