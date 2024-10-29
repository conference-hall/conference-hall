import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { TagSelect } from '~/routes/__components/tags/tag-select.tsx';
import { Tag } from '~/routes/__components/tags/tag.tsx';
import type { Tag as TagType } from '~/types/tags.types.ts';

type TagsCardProps = { proposalTags: Array<TagType>; eventTags: Array<TagType> };

export function TagsCard({ proposalTags, eventTags }: TagsCardProps) {
  const submit = useSubmit();

  const tags = sortBy(proposalTags, 'name');

  const onChangeTags = (tags: Array<TagType>) => {
    const formData = new FormData();
    formData.set('intent', 'save-tags');
    for (const tag of tags) {
      formData.append('tags', tag.id);
    }
    submit(formData, { method: 'POST', navigate: false, preventScrollReset: true });
  };

  return (
    <Card as="section" className="p-4 lg:p-6">
      <TagSelect tags={eventTags} defaultValues={tags} onChange={onChangeTags}>
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            Tags
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
        </div>
      </TagSelect>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? <Text size="xs">No tags yet.</Text> : null}

        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag} />
        ))}
      </div>
    </Card>
  );
}
