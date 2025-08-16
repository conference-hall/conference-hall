import { useFetcher } from 'react-router';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { TagsSelectPanel } from '../../new-proposal/tags-select-panel.tsx';

type TagsSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalTags: Array<TagType>;
  eventTags: Array<TagType>;
  canEditEventProposals: boolean;
  canEditEvent: boolean;
  className?: string;
};

export function TagsSection({
  team,
  event,
  proposalId,
  proposalTags,
  eventTags,
  canEditEventProposals,
  canEditEvent,
  className,
}: TagsSectionProps) {
  const fetcher = useFetcher({ key: `save-tags:${proposalId}` });

  // optimistic update
  let displayedTags = proposalTags;
  if (fetcher.formData?.get('intent') === 'save-tags') {
    const pending = fetcher.formData?.getAll('tags') as string[];
    displayedTags = eventTags.filter((tag) => pending.includes(tag.id));
  }
  displayedTags = sortBy(displayedTags, 'name');

  const update = (tags: Array<TagType>) => {
    const formData = new FormData();
    formData.set('intent', 'save-tags');
    for (const tag of tags) {
      formData.append('tags', tag.id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <TagsSelectPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayedTags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
      options={eventTags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
      onChange={(selected) => {
        update(selected.map((option) => eventTags.find((tag) => tag.id === option.value)!).filter(Boolean));
      }}
      readonly={!canEditEventProposals}
      showAction={canEditEvent}
      className={className}
    />
  );
}
