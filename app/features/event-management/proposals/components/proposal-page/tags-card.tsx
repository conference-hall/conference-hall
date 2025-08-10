import { useFetcher } from 'react-router';
import { Card } from '~/design-system/layouts/card.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { TagsSelectPanel } from '../new-proposal/tags-select-panel.tsx';

type TagsCardProps = {
  proposalId: string;
  proposalTags: Array<TagType>;
  eventTags: Array<TagType>;
  canEditProposalTags: boolean;
  canEditEventTags: boolean;
};

export function TagsCard({
  proposalId,
  proposalTags,
  eventTags,
  canEditProposalTags,
  canEditEventTags,
}: TagsCardProps) {
  const { team, event } = useCurrentEventTeam();

  const fetcher = useFetcher({ key: 'save-tags' });

  // optimistic
  let displayedTags = proposalTags;
  if (fetcher.formData?.get('intent') === 'save-tags') {
    const pendingTags = fetcher.formData?.getAll('tags') as string[];
    displayedTags = eventTags.filter((tag) => pendingTags.includes(tag.id));
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
    <Card as="section" className="p-4 lg:p-6">
      <TagsSelectPanel
        key={proposalId}
        team={team.slug}
        event={event.slug}
        value={displayedTags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
        options={eventTags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
        onChange={(selectedTags) => {
          update(selectedTags.map((option) => eventTags.find((tag) => tag.id === option.value)!).filter(Boolean));
        }}
        readonly={!canEditProposalTags}
        canManageTags={canEditEventTags}
        className="space-y-2.5"
      />
    </Card>
  );
}
