import { useFetcher } from 'react-router';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { CategoriesPanel } from '../../form-panels/categories-panel.tsx';

type CategoriesSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalCategories: Array<{ id: string; name: string }>;
  eventCategories: Array<{ id: string; name: string }>;
  multiple: boolean;
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
  multiple,
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

  const update = (ids: Array<string>) => {
    const formData = new FormData();
    formData.set('intent', 'save-categories');
    for (const id of ids) {
      formData.append('categories', id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <CategoriesPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({ value: item.id, label: item.name }))}
      options={eventCategories.map((item) => ({ value: item.id, label: item.name }))}
      onChange={(selected) => update(selected.map((option) => option.value))}
      multiple={multiple}
      readonly={!canEditEventProposals}
      showAction={canEditEvent}
      className={className}
    />
  );
}
