import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Link, useFetcher } from 'react-router';
import { SelectPanel } from '~/design-system/forms/select-panel.tsx';
import { PencilSquareMicroIcon } from '~/design-system/icons/pencil-square-micro-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { Tag } from '~/design-system/tag.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';

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
        <SelectPanel
          key={proposalId}
          name="tags"
          label={t('common.tags-list.label')}
          onChange={(values) => update(eventTags.filter((tag) => values.includes(tag.id)))}
          defaultValue={tags.map((tag) => tag.id)}
          options={eventTags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
          footer={canEditEventTags ? <SelectTagFooter /> : null}
        >
          <div className="flex items-center justify-between group">
            <H2 size="s" className="group-hover:text-indigo-600">
              {t('common.tags')}
            </H2>
            <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
          </div>
        </SelectPanel>
      ) : (
        <H2 size="s">{t('common.tags')}</H2>
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
  const fetcher = useFetcher({ key: 'save-tags' });

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

function SelectTagFooter() {
  const { t } = useTranslation();
  return (
    <Link to="../../settings/tags" relative="path" className={cx('text-xs hover:bg-gray-100', menuItem())}>
      <PencilSquareMicroIcon className="text-gray-400" />
      {t('common.tags-list.manage')}
    </Link>
  );
}
