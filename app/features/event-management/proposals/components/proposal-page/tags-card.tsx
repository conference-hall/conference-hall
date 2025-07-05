import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { TagSelect } from '~/features/event-management/proposals/components/proposal-page/tag-select.tsx';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Tag } from '~/shared/design-system/tag.tsx';
import { H2, Text } from '~/shared/design-system/typography.tsx';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';

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
  const { t } = useTranslation();
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
              {t('common.tags')}
            </H2>
            <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
          </div>
        </TagSelect>
      ) : (
        <H2 size="s">{t('tags')}</H2>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? <Text size="xs">{t('event-management.proposal-page.no-tags')}</Text> : null}

        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag} />
        ))}
      </div>
    </Card>
  );
}

function useOptimisticUpdateTags(proposalTags: Array<TagType>, eventTags: Array<TagType>) {
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
