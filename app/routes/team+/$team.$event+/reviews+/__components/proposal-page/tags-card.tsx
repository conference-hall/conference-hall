import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useFetcher } from '@remix-run/react';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { TagSelect } from '~/routes/__components/tags/tag-select.tsx';
import { Tag } from '~/routes/__components/tags/tag.tsx';
import type { Tag as TagType } from '~/types/tags.types.ts';

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
  const { tags, update } = useOptimisticUpdateTags(proposalTags, eventTags);

  return (
    <Card as="section" className="p-4 lg:p-6">
      {canEditProposalTags ? (
        <TagSelect
          key={proposalId}
          tags={eventTags}
          defaultValues={tags}
          onChange={update}
          canEditEventTags={canEditEventTags}
        >
          <div className="flex items-center justify-between group">
            <H2 size="s" className="group-hover:text-indigo-600">
              Tags
            </H2>
            <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
          </div>
        </TagSelect>
      ) : (
        <H2 size="s">Tags</H2>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? <Text size="xs">No tags yet.</Text> : null}

        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag} />
        ))}
      </div>
    </Card>
  );
}

export function useOptimisticUpdateTags(proposalTags: Array<TagType>, eventTags: Array<TagType>) {
  const fetcher = useFetcher();

  // optimistic update
  if (fetcher.formData?.get('intent') === 'save-tags') {
    const pendingTags = fetcher.formData?.getAll('tags') as string[];
    proposalTags = eventTags.filter((tag) => pendingTags.includes(tag.id));
  }

  const update = (tags: Array<TagType>) => {
    const formData = new FormData();
    formData.set('intent', 'save-tags');
    for (const tag of tags) {
      formData.append('tags', tag.id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return { tags: sortBy(proposalTags, 'name'), update };
}
